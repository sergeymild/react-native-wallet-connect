package com.reactnativewalletconnect

import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.*

class WalletConnectModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  init {
    AppWalletConnect.instance.init(reactContext)
  }

  override fun getName(): String {
    return "WalletConnect"
  }

  @ReactMethod
  fun disconnect() {
    AppWalletConnect.disconnect()
  }

  @ReactMethod
  fun personalSign(params: ReadableMap, callback: Callback) {
    Handler(Looper.getMainLooper()).postDelayed({
      val activity = currentActivity
      if (activity == null) {
        callback.invoke(Arguments.createArray())
        return@postDelayed
      }
      AppWalletConnect.personalSign(activity, params, callback)
    }, 1000)
  }

  @ReactMethod
  fun connect(params: ReadableMap, callback: Callback) {
    currentActivity?.runOnUiThread {
      val activity = currentActivity
      if (activity == null) {
        callback.invoke(Arguments.createArray())
        return@runOnUiThread
      }
      AppWalletConnect.connect(activity, params, callback)
    }
  }

}
