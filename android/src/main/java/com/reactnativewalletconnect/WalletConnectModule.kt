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
  fun connect(params: ReadableMap, callback: Callback) {
    Handler(Looper.getMainLooper()).post(Runnable {
      val activity = currentActivity
      if (activity == null) {
        callback.invoke(Arguments.createArray())
        return@Runnable
      }
      AppWalletConnect.connect(activity, params, callback)
    })
  }

}
