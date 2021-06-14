/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableHighlight,
  Alert,
} from "react-native";
import Button from "../../components/Button";
import { DeviceEventEmitter } from "react-native";
import DataWedgeIntents from "react-native-datawedge-intents";
// import AwesomeAlert from 'react-native-awesome-alerts';
import {
  Container,
  PivotCard,
  PivotTitle,
  PivotPlaceholder,
  PivotData,
  Card,
  ScanData,
  ScanDataPlaceholderLeft,
  ScanPlaceholderHeaderRight,
} from "./styles";
import ToggleSwitch from "toggle-switch-react-native";

export default function DataWedge() {
  const [deviceEmitterSubscription, setDeviceEmitterSubscription] = useState(
    {}
  );
  const [sendCommandResult, setSendCommandResult] = useState("false");

  const [scanButtonVisible, setScanButtonVisible] = useState(false);

  const [lastApiVisible, setLastApiVisible] = useState(false);
  const [enumeratedScannersText, setEnumeratedScannersText] = useState(
    "Requires DataWedge 6.3+"
  );
  const [scannedData, setScannedData] = useState("");
  const [humanReadableScannerList, setHumanReadableScannerList] = useState("");
  const [switchButton, setSwitchButton] = useState(false);

  useEffect(() => {
    setDeviceEmitterSubscription(
      DeviceEventEmitter.addListener("datawedge_broadcast_intent", (intent) => {
        broadcastReceiver(intent);
      })
    );
    registerBroadcastReceiver();
    determineVersion();
    //  Set the new configuration
    const profileConfig = {
      PROFILE_NAME: "ZebraReactNativeDemo",
      PROFILE_ENABLED: "true",
      CONFIG_MODE: "UPDATE",
      PLUGIN_CONFIG: {
        PLUGIN_NAME: "BARCODE",
        PARAM_LIST: {
          //"current-device-id": this.selectedScannerId,
          scanner_selection: "auto",
          aim_type: "2",
          aim_timer: "100",
        },
      },
    };
    sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);
    console.log("montou");
  }, []);

  function _onPressScanButton() {
    sendCommand(
      "com.symbol.datawedge.api.SOFT_SCAN_TRIGGER",
      "TOGGLE_SCANNING"
    );
  }

  function determineVersion() {
    sendCommand("com.symbol.datawedge.api.GET_VERSION_INFO", "");
  }

  function sendCommand(extraName, extraValue) {
    console.log(
      "Sending Command: " + extraName + ", " + JSON.stringify(extraValue)
    );
    const broadcastExtras = {};
    broadcastExtras[extraName] = extraValue;
    broadcastExtras["SEND_RESULT"] = sendCommandResult;
    DataWedgeIntents.sendBroadcastWithExtras({
      action: "com.symbol.datawedge.api.ACTION",
      extras: broadcastExtras,
    });
  }

  function registerBroadcastReceiver() {
    DataWedgeIntents.registerBroadcastReceiver({
      filterActions: [
        "com.zebra.reactnativedemo.ACTION",
        "com.symbol.datawedge.api.RESULT_ACTION",
      ],
      filterCategories: ["android.intent.category.DEFAULT"],
    });
  }

  function broadcastReceiver(intent) {
    //  Broadcast received
    // console.log('Received Intent: ' + JSON.stringify(intent));
    if (intent.hasOwnProperty("RESULT_INFO")) {
      const commandResult =
        intent.RESULT +
        " (" +
        intent.COMMAND.substring(
          intent.COMMAND.lastIndexOf(".") + 1,
          intent.COMMAND.length
        ) +
        ")"; // + JSON.stringify(intent.RESULT_INFO);
      commandReceived(commandResult.toLowerCase());
    }

    if (
      intent.hasOwnProperty("com.symbol.datawedge.api.RESULT_GET_VERSION_INFO")
    ) {
      //  The version has been returned (DW 6.3 or higher).  Includes the DW version along with other subsystem versions e.g MX
      const versionInfo =
        intent["com.symbol.datawedge.api.RESULT_GET_VERSION_INFO"];
      console.log("Version Info: " + JSON.stringify(versionInfo));
      const datawedgeVersion = versionInfo["DATAWEDGE"];
      console.log("Datawedge version: " + datawedgeVersion);

      //  Fire events sequentially so the application can gracefully degrade the functionality available on earlier DW versions
      if (datawedgeVersion >= "6.3") datawedge63();
      if (datawedgeVersion >= "6.4") datawedge64();
      if (datawedgeVersion >= "6.5") datawedge65();
    } else if (
      intent.hasOwnProperty(
        "com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS"
      )
    ) {
      //  Return from our request to enumerate the available scanners
      const enumeratedScannersObj =
        intent["com.symbol.datawedge.api.RESULT_ENUMERATE_SCANNERS"];
      enumerateScanners(enumeratedScannersObj);
    } else if (
      intent.hasOwnProperty(
        "com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE"
      )
    ) {
      //  Return from our request to obtain the active profile
      const activeProfileObj =
        intent["com.symbol.datawedge.api.RESULT_GET_ACTIVE_PROFILE"];
      activeProfile(activeProfileObj);
    } else if (!intent.hasOwnProperty("RESULT_INFO")) {
      //  A barcode has been scanned
      barcodeScanned(intent, new Date().toLocaleString());
    }

    // console.log('AÇPJA' + intent['com.symbol.datawedge.data_string']);
    // for (const prop in intent) {
    //   // ctrl+shift+k (para abrir o console no mozilla firefox)
    //   console.log('intent.' + prop + ' = ' + intent[prop]);
    // }
  }

  function datawedge63() {
    console.log("Datawedge 6.3 APIs are available");
    //  Create a profile for our application
    sendCommand(
      "com.symbol.datawedge.api.CREATE_PROFILE",
      "ZebraReactNativeDemo"
    );

    //  Although we created the profile we can only configure it with DW 6.4.
    sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");

    //  Enumerate the available scanners on the device
    sendCommand("com.symbol.datawedge.api.ENUMERATE_SCANNERS", "");

    //  Functionality of the scan button is available
    // setScanButtonVisible(true);
  }

  function datawedge64() {
    console.log("Datawedge 6.4 APIs are available");

    //  Documentation states the ability to set a profile config is only available from DW 6.4.
    //  For our purposes, this includes setting the decoders and configuring the associated app / output params of the profile.

    //document.getElementById('info_datawedgeVersion').classList.remove("attention");

    //  Decoders are now available

    //  Configure the created profile (associated app and keyboard plugin)
    const profileConfig = {
      PROFILE_NAME: "ZebraReactNativeDemo",
      PROFILE_ENABLED: "true",
      CONFIG_MODE: "UPDATE",
      PLUGIN_CONFIG: {
        PLUGIN_NAME: "BARCODE",
        RESET_CONFIG: "true",
        PARAM_LIST: {},
      },
      APP_LIST: [
        {
          PACKAGE_NAME: "com.datawedgereactnative.demo",
          ACTIVITY_LIST: ["*"],
        },
      ],
    };
    sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig);

    //  Configure the created profile (intent plugin)
    const profileConfig2 = {
      PROFILE_NAME: "ZebraReactNativeDemo",
      PROFILE_ENABLED: "true",
      CONFIG_MODE: "UPDATE",
      PLUGIN_CONFIG: {
        PLUGIN_NAME: "INTENT",
        RESET_CONFIG: "true",
        PARAM_LIST: {
          intent_output_enabled: "true",
          intent_action: "com.zebra.reactnativedemo.ACTION",
          intent_delivery: "2",
        },
      },
    };
    sendCommand("com.symbol.datawedge.api.SET_CONFIG", profileConfig2);

    //  Give some time for the profile to settle then query its value
    setTimeout(() => {
      sendCommand("com.symbol.datawedge.api.GET_ACTIVE_PROFILE", "");
    }, 1000);
  }

  function datawedge65() {
    console.log("Datawedge 6.5 APIs are available");

    //  Instruct the API to send
    setSendCommandResult("true");
    setLastApiVisible(true);
  }

  function commandReceived(commandText) {
    console.log(commandText);
  }

  function enumerateScanners(enumeratedScanners) {
    setHumanReadableScannerList("");
    for (var i = 0; i < enumeratedScanners.length; i++) {
      console.log(
        "Scanner found: name= " +
          enumeratedScanners[i].SCANNER_NAME +
          ", id=" +
          enumeratedScanners[i].SCANNER_INDEX +
          ", connected=" +
          enumeratedScanners[i].SCANNER_CONNECTION_STATE
      );
      setHumanReadableScannerList(
        humanReadableScannerList + enumeratedScanners[i].SCANNER_NAME
      );
      if (i < enumeratedScanners.length - 1)
        setHumanReadableScannerList(humanReadableScannerList + ", ");
    }
    setEnumeratedScannersText(humanReadableScannerList);
  }

  function activeProfile(theActiveProfile) {
    console.log(theActiveProfile);
  }

  function barcodeScanned(scanData, timeOfScan) {
    if (scanData["com.symbol.datawedge.data_string"] !== undefined)
      setScannedData(scanData["com.symbol.datawedge.data_string"]);

    const x = scanData["com.symbol.datawedge.data_string"];
    const scannedType = scanData["com.symbol.datawedge.label_type"];
    console.log("Scan: " + x);
  }

  return (
    <>
      <ToggleSwitch
        isOn={false}
        onColor="green"
        offColor="red"
        label="Example label"
        labelStyle={{ color: "black", fontWeight: "900" }}
        size="large"
        onToggle={() => {
          setSwitchButton(true);
        }}
      />
      <Text>
        {scannedData}++++++++++{typeof scannedData}++++++++++
        {scannedData.length}
      </Text>
    </>
  );
}
