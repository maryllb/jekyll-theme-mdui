var CACHE = 'cache-and-update';

var urlsToCache = [
  
    
      '/403.html',
    
  
    
       
    
  
    
      '/category/Living.html',
    
  
    
      '/https:/who.aaaab3n.moe/',
    
  
    
      '/category/',
    
  
    
      '/editor/',
    
  
    
      '/friends/',
    
  
    
      '/assets/css/global.css',
    
  
    
      '/',
    
  
    
      '/love/',
    
  
    
      '/search.json',
    
  
    
      '/sw.js',
    
  
    
      '/tags/',
    
  
    
      '/tags.json',
    
  
    
      '/category/technology.html',
    
  
    
      '/sitemap.xml',
    
  
    
      '/robots.txt',
    
  
    
      '/blog/page2/',
    
  
    
      '/blog/page3/',
    
  
    
      '/blog/page4/',
    
  
    
      '/blog/page5/',
    
  
    
      '/blog/page6/',
    
  
    
      '/feed.xml',
    
  

  
    '/technology/2020/12/04/CS140-L1.html',
  
    '/technology/2020/11/28/github-and-cloudflare.html',
  
    '/literature/2020/10/08/lunwen.html',
  
    '/technology/2020/09/13/fresh.html',
  
    '/literature/2020/08/31/Leviathan.html',
  
    '/technology/2020/08/21/fstab.html',
  
    '/life/2020/07/23/Run-away-from-shanghaitech-%E5%89%AF%E6%9C%AC.html',
  
    '/technology/2020/07/07/pigeon-oj-config.html',
  
    '/technology/2020/07/07/618-workstation-setup-guide.html',
  
    '/life/2020/05/31/birthday2020.html',
  
    '/education/2020/05/09/curcuit-midterm.html',
  
    '/life/2020/04/18/an-reply.html',
  
    '/life/2020/04/15/computer-science.html',
  
    '/technology/2020/04/15/RSA.html',
  
    '/technology/2020/04/12/aplinelatest_error_with_multidict.html',
  
    '/technology/2020/03/24/remote-ssh-on-vscode.html',
  
    '/literature/2020/03/01/free-Internet.html',
  
    '/life/2020/01/29/monthly-report.html',
  
    '/technology/2020/01/14/server-move.html',
  
    '/life/2019/12/31/2020-say-hello.html',
  
    '/technology/2019/11/29/c-cpp-black-magic.html',
  
    '/literature/2019/10/17/one-hundred-book-2019.html',
  
    '/technology/2019/08/04/talking-about-v2ray.html',
  
    '/education/2019/06/02/Englishwriting-showoff-guide.html',
  
    '/literature/2019/02/07/the-wandering-earth.html',
  
    '/technology/2019/01/30/raspberrypi-clash-tutor.html',
  
    '/literature/2018/11/06/Love-Abyss-Freedom.html',
  

  
    '/CHANGELOG.md',
  
    '/assets/css/customCss.css',
  
    '/assets/images/touch/apple-touch-icon.png',
  
    '/assets/images/touch/chrome-touch-icon-192x192.png',
  
    '/assets/images/touch/icon-128x128.png',
  
    '/assets/images/touch/ms-touch-icon-144x144-precomposed.png',
  
    '/assets/js/History.js',
  
    '/assets/js/customJS.js',
  
    '/jekylltheme.jpg',
  
    '/manifest.json',
  
];

self.addEventListener('install', function(evt) {
  evt.waitUntil(caches.open(CACHE).then(function(cache) {
    cache.addAll(urlsToCache);
  }));
});

self.addEventListener('fetch', function(evt) {
  evt.respondWith(fromCache(evt.request));
  evt.waitUntil(update(evt.request));
});

function fromCache(request) {
  return caches.open(CACHE).then(function(cache) {
    return cache.match(request).then(function(response) {
      if (response != undefined) {
        return response;
      } else {
        return fetchFromInternet(request);
      }
    });
  }).catch(function() {
    return caches.match('/offline.html');
  });
}

function update(request) {
  return caches.open(CACHE).then(function(cache) {
    return fetchFromInternet(request);
  });
}

function fetchFromInternet(request) {
  var fetchRequset = request.clone();
  return fetch(fetchRequset).then(function(response) {
    if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
    }
    var responseToCache = response.clone();
    caches.open(CACHE).then(function(cache) {
      cache.put(request, responseToCache);
    });
    return response;
  });
}
