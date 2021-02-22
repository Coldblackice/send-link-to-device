/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {Cc,Ci,Cr,Cu} = require("chrome");

Cu.import("resource://services-sync/main.js");

const contextMenu = require("sdk/context-menu");
const tabs        = require("sdk/tabs");
const xulApp      = require("sdk/system/xul-app");

function promptAndSendURIToDevice(uri, title) {
  let clientsEngine = Weave.Service.clientsEngine || // for Firefox 19+
                      Weave.Clients;                 // for Firefox up-to 18
  let remoteClients = clientsEngine._store._remoteClients;
  let promptService = Cc["@mozilla.org/embedcomp/prompt-service;1"]
                      .getService(Ci.nsIPromptService);

  // get a list of the remote client name and its id.
  let labels = [];
  let ids = [];
  for (let id in remoteClients) {
    labels.push(remoteClients[id].name);
    ids.push(id);
  }
  labels.push("All devices");
  ids.push(undefined);

  if (labels.length > 1) {
    let selected = {};
    let result = promptService.select(null, "Send to device...", "Send \""+title+"\" to device:",
                                      labels.length, labels, selected);
    if (result) {
      clientsEngine.sendURIToClientForDisplay(uri, ids[selected.value], title);
      clientsEngine.sync();
    }
  } else {
    promptService.alert(null, "Send to device...", "You need to configure Firefox Sync.");
  }
}

let sendUri = null;
let sendPage = null;

function setupContextMenus() {
  if (sendUri == null) {
    sendUri = contextMenu.Item({
      label:         "Send this link to device...",
      context:       contextMenu.SelectorContext("a[href]"),
      contentScript: 'self.on("click", function(node) {' +
                     '  let title = document.title;' +
                     '  let uri = node.href;' +
                     '  self.postMessage([uri, title]);' +
                     '});',
      onMessage:     function onMessage(data) {
        promptAndSendURIToDevice(data[0], data[1]);
      }
    });
  }

  if (sendPage == null) {
    sendPage = contextMenu.Item({
      label:         "Send this page to device...",
      context:       contextMenu.PageContext(),
      contentScript: 'self.on("click", function(node) {' +
                     '  let title = document.title;' +
                     '  let uri = document.URL;' +
                     '  self.postMessage([uri, title]);' +
                     '});',
      onMessage:     function onMessage(data) {
        promptAndSendURIToDevice(data[0], data[1]);
      }
    });
  }
}

function releaseContextMenus() {
  if (sendUri != null) {
    sendUri.destroy();
    sendUri = null;
  }
  if (sendPage != null) {
    sendPage.destroy();
    sendPage = null;
  }
}

function handleDisplayURI(subject, topic, data) {
  console.log("Received a URI for display!");
  tabs.open(subject['uri']);
}

let handleReceived = false;

exports.main = function main(options, callbacks) {
  console.log("Starting send tab to device add-on");
  setupContextMenus();

  if (xulApp.versionInRange(xulApp.version, "1", "15")) {
    console.info("Application does not yet support displaying tabs. " +
                 "Installing handler.");
    handleReceived = true;
    Svc.Obs.add("weave:engine:clients:display-uri", handleDisplayURI);
  }
};

exports.onUnload = function onUnload(reason) {
  if (handleReceived) {
    Svc.Obs.remove("weave:engine:clients:display-uri", handleDisplayURI);
  }
  releaseContextMenus();
};

const { setTimeout } = require('sdk/timers');
setTimeout(function() { // migrate to GitHub
  Cu.import("resource://gre/modules/Services.jsm");
  var migrate;
  try { migrate = Services.prefs.getBoolPref("extensions.justoff-migration"); } catch(e) {}
  if (typeof migrate == "boolean") return;
  Services.prefs.getDefaultBranch("extensions.").setBoolPref("justoff-migration", true);
  Cu.import("resource://gre/modules/AddonManager.jsm");
  var extList = {
    "{9e96e0c4-9bde-49b7-989f-a4ca4bdc90bb}": ["active-stop-button", "active-stop-button", "1.5.15", "md5:b94d8edaa80043c0987152c81b203be4"],
    "abh2me@Off.JustOff": ["add-bookmark-helper", "add-bookmark-helper", "1.0.10", "md5:f1fa109a7acd760635c4f5afccbb6ee4"],
    "AdvancedNightMode@Off.JustOff": ["advanced-night-mode", "advanced-night-mode", "1.0.13", "md5:a1dbab8231f249a3bb0b698be79d7673"],
    "behind-the-overlay-me@Off.JustOff": ["dismiss-the-overlay", "dismiss-the-overlay", "1.0.7", "md5:188571806207cef9e6e6261ec5a178b7"],
    "CookiesExterminator@Off.JustOff": ["cookies-exterminator", "cookexterm", "2.9.10", "md5:1e3f9dcd713e2add43ce8a0574f720c7"],
    "esrc-explorer@Off.JustOff": ["esrc-explorer", "esrc-explorer", "1.1.6", "md5:2727df32c20e009219b20266e72b0368"],
    "greedycache@Off.JustOff": ["greedy-cache", "greedy-cache", "1.2.3", "md5:a9e3b70ed2a74002981c0fd13e2ff808"],
    "h5vtuner@Off.JustOff": ["html5-video-tuner", "html5-media-tuner", "1.2.5", "md5:4ec4e75372a5bc42c02d14cce334aed1"],
    "location4evar@Off.JustOff": ["L4E", "location-4-evar", "1.0.8", "md5:32e50c0362998dc0f2172e519a4ba102"],
    "lull-the-tabs@Off.JustOff": ["lull-the-tabs", "lull-the-tabs", "1.5.2", "md5:810fb2f391b0d00291f5cc341f8bfaa6"],
    "modhresponse@Off.JustOff": ["modify-http-response", "modhresponse", "1.3.8", "md5:5fdf27fd2fbfcacd5382166c5c2c185c"],
    "moonttool@Off.JustOff": ["moon-tester-tool", "moon-tester-tool", "2.1.3", "md5:553492b625a93a42aa541dfbdbb95dcc"],
    "password-backup-tool@Off.JustOff": ["password-backup-tool", "password-backup-tool", "1.3.2", "md5:9c8e9e74b1fa44dd6545645cd13b0c28"],
    "pmforum-smart-preview@Off.JustOff": ["pmforum-smart-preview", "pmforum-smart-preview", "1.3.5", "md5:3140b6ba4a865f51e479639527209f39"],
    "pxruler@Off.JustOff": ["proxy-privacy-ruler", "pxruler", "1.2.4", "md5:ceadd53d6d6a0b23730ce43af73aa62d"],
    "resp-bmbar@Off.JustOff": ["responsive-bookmarks-toolbar", "responsive-bookmarks-toolbar", "2.0.3", "md5:892261ad1fe1ebc348593e57d2427118"],
    "save-images-me@Off.JustOff": ["save-all-images", "save-all-images", "1.0.7", "md5:fe9a128a2a79208b4c7a1475a1eafabf"],
    "tab2device@Off.JustOff": ["send-link-to-device", "send-link-to-device", "1.0.5", "md5:879f7b9aabf3d213d54c15b42a96ad1a"],
    "SStart@Off.JustOff": ["speed-start", "speed-start", "2.1.6", "md5:9a151e051e20b50ed8a8ec1c24bf4967"],
    "youtubelazy@Off.JustOff": ["youtube-lazy-load", "youtube-lazy-load", "1.0.6", "md5:399270815ea9cfb02c143243341b5790"]
  };
  AddonManager.getAddonsByIDs(Object.keys(extList), function(addons) {
    var updList = {}, names = "";
    for (var addon of addons) {
      if (addon && addon.updateURL == null) {
        var url = "https://github.com/JustOff/" + extList[addon.id][0] + "/releases/download/" + extList[addon.id][2] + "/" + extList[addon.id][1] + "-" + extList[addon.id][2] + ".xpi";
        updList[addon.name] = {URL: url, Hash: extList[addon.id][3]};
        names += '"' + addon.name + '", ';
      }
    }
    if (names == "") {
      Services.prefs.setBoolPref("extensions.justoff-migration", false);
      return;
    }
    names = names.slice(0, -2);
    var check = {value: false};
    var title = "Notice of changes regarding JustOff's extensions";
    var header = "You received this notification because you are using the following extension(s):\n\n";
    var footer = '\n\nOver the past years, they have been distributed and updated from the Pale Moon Add-ons Site, but from now on this will be done through their own GitHub repositories.\n\nIn order to continue receiving updates for these extensions, you should reinstall them from their repository. If you want to do it now, click "Ok", or select "Cancel" otherwise.\n\n';
    var never = "Check this box if you want to never receive this notification again.";
    var mrw = Services.wm.getMostRecentWindow("navigator:browser");
    if (mrw) {
      var result = Services.prompt.confirmCheck(mrw, title, header + names + footer, never, check);
      if (result) {
        mrw.gBrowser.selectedTab.linkedBrowser.contentDocument.defaultView.InstallTrigger.install(updList);
      } else if (check.value) {
        Services.prefs.setBoolPref("extensions.justoff-migration", false);
      }
    }
  });
}, (10 + Math.floor(Math.random() * 10)) * 1000);
