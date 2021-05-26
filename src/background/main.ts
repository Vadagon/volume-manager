import data from "./globals";

chrome.storage.sync.get(["user"], function (items) {
  console.log(items.user)

  if (items && items.user) {
    data.user = items.user;
  } else {
    chrome.storage.sync.set({ user: data.user });
  }
});


chrome.runtime.getPlatformInfo(function(info) {
  data.OS = info.os;
})

// GOOGLE ANALYSTICS
data._gaq = globalThis._gaq || [];
data._gaq.push(['_setAccount', 'UA-131310674-3']);
data._gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script');
  ga.type = 'text/javascript';
  ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(ga, s);
})();


import './listeners';