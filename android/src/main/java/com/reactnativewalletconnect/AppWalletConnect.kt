package com.reactnativewalletconnect

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.net.Uri
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReadableMap
import com.squareup.moshi.Moshi
import okhttp3.OkHttpClient
import org.komputing.khex.extensions.toNoPrefixHexString
import org.walletconnect.Session
import org.walletconnect.impls.*
import org.walletconnect.nullOnThrow
import java.io.File
import java.lang.ref.WeakReference
import java.net.URLEncoder
import java.util.*

class AppWalletConnect : Session.Callback {
  private lateinit var moshi: Moshi
  private lateinit var client: OkHttpClient
  private lateinit var storage: WCSessionStore
  private lateinit var config: Session.FullyQualifiedConfig
  var session: Session? = null
  fun init(context: Context) {
    initMoshi()
    initClient()
    initSessionStorage(context)
  }

  private fun initClient() {
    client = OkHttpClient.Builder().build()
  }

  private fun initMoshi() {
    moshi = Moshi.Builder().build()
  }

  private fun initSessionStorage(context: Context) {
    storage = FileWCSessionStore(
      File(context.cacheDir, "session_store.json").apply { createNewFile() },
      moshi
    )
  }

  fun resetSession(params: ReadableMap) {
    nullOnThrow { session }?.clearCallbacks()

    val key = ByteArray(32).also { Random().nextBytes(it) }.toNoPrefixHexString()
    config =
      Session.FullyQualifiedConfig(UUID.randomUUID().toString(), params.getString("bridge")!!, key)
    session = WCSession(
      config,
      MoshiPayloadAdapter(moshi),
      storage,
      OkHttpTransport.Builder(client, moshi),
      Session.PeerMeta(
        name = params.getString("name"),
        description = params.getString("description"),
        icons = if (params.hasKey("icon")) listOf(params.getString("icon")!!) else emptyList(),
        url = params.getString("url")
      )
    )
    session?.offer()
  }

  override fun onMethodCall(call: Session.MethodCall) {
    when(call) {
      is Session.MethodCall.SessionRequest -> {
        println("AppWalletConnect.methodCall.Session.MethodCall.SessionRequest")
      }
      is Session.MethodCall.SessionUpdate -> {
        println("AppWalletConnect.methodCall.Session.MethodCall.SessionUpdate")
      }
      is Session.MethodCall.SendTransaction -> {
        println("AppWalletConnect.methodCall.Session.MethodCall.SendTransaction")
      }
      is Session.MethodCall.SignMessage -> {
        println("AppWalletConnect.methodCall.Session.MethodCall.SignMessage")
      }
      is Session.MethodCall.Custom -> {
        println("AppWalletConnect.methodCall.Session.MethodCall.Custom")
      }
      is Session.MethodCall.Response -> {
        println("AppWalletConnect.methodCall.Session.MethodCall.Response")
      }
    }
  }

  override fun onStatus(status: Session.Status) {
    println("AppWalletConnect.onStatus $status")
    when (status) {
      Session.Status.Approved -> sessionApproved()
      Session.Status.Closed -> sessionClosed()
      Session.Status.Connected -> {}
      Session.Status.Disconnected,
      is Session.Status.Error -> {
        println("AppWalletConnect.onStatus.close")
        resolvePromise?.get()?.invoke(Arguments.createMap().also {
          it.putString("type", "success")
          it.putArray("addresses", Arguments.createArray())
        })
        resolvePromise = null
      }
    }
  }

  private fun sessionApproved() {
    println("AppWalletConnect.sessionApproved")
    val strings = instance.session?.approvedAccounts()
    if (strings != null) {
      val createArray = Arguments.createArray();
      for (string in strings) createArray.pushString(string)
      resolvePromise?.get()?.invoke(Arguments.createMap().also {
        it.putString("type", "success")
        it.putArray("addresses", createArray)
      })
    }
    resolvePromise = null
  }

  private fun sessionClosed() {
    println("AppWalletConnect.sessionClosed")
    resolvePromise?.get()?.invoke(Arguments.createMap().also {
      it.putString("type", "success")
      it.putArray("addresses", Arguments.createArray())
    })
    resolvePromise = null
  }

  var resolvePromise: WeakReference<Callback>? = null

  fun toWCUri(): String {
    return "wc:${config.handshakeTopic}@${config.version}?bridge=${
      URLEncoder.encode(
        config.bridge,
        "UTF-8"
      )
    }&key=${config.key}"
  }

  private fun getConnectionUrl(scheme: String, wcUrl: String): String {
    val _encodeURL = URLEncoder.encode(wcUrl, "UTF-8")
    val _end2 = _encodeURL.replace("=", "%3D").replace("&", "%26")
    var s = if (scheme.startsWith("/")) scheme else "$scheme/"
    s += "wc?uri="
    return "$s$_end2"
  }

  companion object {
    @JvmField
    var instance = AppWalletConnect()

    fun disconnect() {
      instance.session?.clearCallbacks()
      instance.session = null
    }

    fun personalSign(activity: Activity, params: ReadableMap, callback: Callback) {
      try {
        instance.session?.addCallback(instance)
        instance.session?.performMethodCall(Session.MethodCall.Custom(2, "personal_sign", listOf(params.getString("address"), params.getString("message")))) {
          if (it.result != null && it.result is String) {
            callback.invoke(Arguments.createMap().apply {
              putString("type", "success")
              putString("message", it.result as String)
            })
          } else {
            callback.invoke(Arguments.createMap().apply {
              putString("type", "error")
              putString("message", it.error?.message ?: "ERROR_SIGN")
            })
          }
        }
        val intent = Intent(Intent.ACTION_VIEW)
        val toWCUri = instance.toWCUri();
        intent.data = Uri.parse(
          if (params.getString("wallet") != null) instance.getConnectionUrl(
            params.getString("wallet")!!, toWCUri
          ) else toWCUri
        )
        activity.startActivity(intent)
      } catch (e: Throwable) {
        println("AppWalletConnect.personalSign.error" + e.message)
        if (e.message?.contains("No Activity found to handle") == true) {
          callback.invoke(Arguments.createMap().also {
            it.putString("type", "error")
            it.putString("error", "NO_WALLETS")
          })
        } else {
          callback.invoke(Arguments.createMap().also {
            it.putString("type", "success")
            it.putArray("addresses", Arguments.createArray())
          })
        }
      }
    }

    @JvmStatic
    fun connect(activity: Activity, params: ReadableMap, callback: Callback) {
      instance.resolvePromise = WeakReference(callback)
      try {
        instance.resetSession(params)
        instance.session?.addCallback(instance)
        val intent = Intent(Intent.ACTION_VIEW)
        val toWCUri = instance.toWCUri();
        intent.data = Uri.parse(
          if (params.getString("wallet") != null) instance.getConnectionUrl(
            params.getString("wallet")!!, toWCUri
          ) else toWCUri
        )
        activity.startActivity(intent)
      } catch (e: Throwable) {
        println("AppWalletConnect.connect.error " + e.message)
        if (e.message?.contains("No Activity found to handle") == true) {
          callback.invoke(Arguments.createMap().also {
            it.putString("type", "error")
            it.putString("error", "NO_WALLETS")
          })
        } else {
          callback.invoke(Arguments.createMap().also {
            it.putString("type", "success")
            it.putArray("addresses", Arguments.createArray())
          })
        }
      }
    }
  }
}
