package com.oozuki2;

import com.facebook.react.ReactActivity;

import android.content.Intent;     // <--- import
import android.os.Bundle;

import android.content.Intent;

import com.reactnativenavigation.NavigationActivity;

public class MainActivity extends NavigationActivity {
    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }

}
