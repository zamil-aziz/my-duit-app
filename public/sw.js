if(!self.define){let e,s={};const t=(t,a)=>(t=new URL(t+".js",a).href,s[t]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=t,e.onload=s,document.head.appendChild(e)}else e=t,importScripts(t),s()})).then((()=>{let e=s[t];if(!e)throw new Error(`Module ${t} didn’t register its module`);return e})));self.define=(a,n)=>{const i=e||("document"in self?document.currentScript.src:"")||location.href;if(s[i])return;let c={};const r=e=>t(e,i),o={module:{uri:i},exports:c,require:r};s[i]=Promise.all(a.map((e=>o[e]||r(e)))).then((e=>(n(...e),c)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"3dc0d8495ce6f0ca0afaafab1a619115"},{url:"/_next/static/7-H6JM96rjz3tQJs0d3D0/_buildManifest.js",revision:"0d59b18cdf1aefce7f3738147c9b33ac"},{url:"/_next/static/7-H6JM96rjz3tQJs0d3D0/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/173-7be02dd55462ff0c.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/203.2b4c1ee4fbe3a7cf.js",revision:"2b4c1ee4fbe3a7cf"},{url:"/_next/static/chunks/218.57a830a2c55ba802.js",revision:"57a830a2c55ba802"},{url:"/_next/static/chunks/4bd1b696-9924fae48e609361.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/517-851d1ad4aea40ac5.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/572-bb3799205751120b.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/674-201b2d5e5a36d9c1.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/_not-found/page-80f2ab645733973c.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/api/auth/login/route-34774ac4761fa8ae.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/api/auth/signup/route-18c4e93e9b98c44e.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/api/expenses/add/route-3744ea25bdf579bf.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/api/expenses/delete/route-75a90602826bf99c.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/api/expenses/route-dba4a9c9faae42f3.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/api/expenses/update/route-08db1db6854164ab.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/dashboard/page-3f57d43be6750701.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/layout-58003976cc5fc552.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/login/page-c60d3d4b63ea3d5d.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/page-7f2235261045b4d8.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/app/signup/page-1540a0f93aa540de.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/framework-6b27c2b7aa38af2d.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/main-app-04b26bf2fb35c10b.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/main-fe0ac361f5291c18.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/pages/_app-430fec730128923e.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/pages/_error-2d7241423c4a35ba.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-ccb7b6d46ecdb025.js",revision:"7-H6JM96rjz3tQJs0d3D0"},{url:"/_next/static/css/893806433333bb08.css",revision:"893806433333bb08"},{url:"/_next/static/media/569ce4b8f30dc480-s.p.woff2",revision:"ef6cefb32024deac234e82f932a95cbd"},{url:"/_next/static/media/747892c23ea88013-s.woff2",revision:"a0761690ccf4441ace5cec893b82d4ab"},{url:"/_next/static/media/93f479601ee12b01-s.p.woff2",revision:"da83d5f06d825c5ae65b7cca706cb312"},{url:"/_next/static/media/ba015fad6dcf6784-s.woff2",revision:"8ea4f719af3312a055caf09f34c89a77"},{url:"/image.png",revision:"eb8d0dbde178224a36ebe6fd8f3df1cf"},{url:"/manifest.json",revision:"431bbdd27ec567209b2db8299465a789"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:t,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
