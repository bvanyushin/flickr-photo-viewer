function FlickrAppViewModel() {
  var self = this;

  var apiUrl = "https://api.flickr.com/services/rest/?";
  var userID = "43266322@N06";
  var apiKey = "82aa4c342525ac3bf02945d35a2e1c7b";
  var callbackFormat = "&format=json&nojsoncallback=1";
  
  // user
  function User(data) {
    this.id = data.id;
    this.username = data.username._content;
    this.realname = data.realname._content;
    this.photosCount = data.photos.count._content;
  }

  self.currentUser = ko.observable();

  self.getUserInfo = function() {
    var method = "flickr.people.getInfo";
    var callUrl = apiUrl + "method=" + method + "&api_key=" + apiKey + "&user_id=" + userID + callbackFormat;
    $.getJSON(callUrl, function(allData) {
      var user =  new User (allData.person);
      self.currentUser(user);
    });

  };

  // albums
  function Album(data) {
    console.log(data);
    this.id = data.id;
    this.title = data.title._content;
    this.description = data.description._content;
    this.totalCount = data.photos;
  }
  
  self.albums = ko.observableArray([]);
  self.currentAlbum = ko.observable();
  self.currentAlbumContent = ko.observableArray([]);

  self.getAlbumsList = function() {
    var method = "flickr.photosets.getList";
    var callUrl = apiUrl + "method=" + method + "&api_key=" + apiKey + "&user_id=" + userID + callbackFormat;

    $.getJSON(callUrl, function(allData) {
      var mappedAlbums = $.map(allData.photosets.photoset, function(item) { return new Album(item) });
      self.albums(mappedAlbums);
      self.goToAlbum(mappedAlbums[0]);
    });
  };

  self.goToAlbum = function (album) {
    self.currentAlbum(album);
    self.getAlbumContent();
  };

  self.getAlbumContent = function () {
    var method = "flickr.photosets.getPhotos";
    var callUrl = apiUrl + "method=" + method + "&api_key=" + apiKey + "&photoset_id=" + self.currentAlbum().id + "&user_id=" + userID + callbackFormat;
    $.getJSON(callUrl, function(allData) {
      var mappedPhotos = $.map(allData.photoset.photo, function(item) { return new Photo(item) });
      var mappedPages = [];
      var i = 0; 
      while (mappedPhotos[i * self.photosPerPage]) {
        mappedPages.push(mappedPhotos.slice(i * self.photosPerPage, (i + 1) * self.photosPerPage));
        i += 1;
      };
      self.currentAlbumContent(mappedPages);
      self.goToPage(1);
    });
  };

  // pages
  self.photosPerPage = 9;

  self.pageCount = ko.observable();
  self.currentPage = ko.observable();
  self.currentPageContent = ko.observableArray([]);

  self.currentAlbumContent.subscribe( function() {
    self.pageCount(self.currentAlbumContent().length);
  });

// // Should be moved to new binding, not working yet
//   self.constructPaging = function() {
//     var $p = $(".pagination");
//     for (var i = 1; i <= self.pageCount(); i++) {
//       var tagText = "<li data-bind=\"css: (currentPage() <= " + i + ") ? 'active' : ''\">"
//       tagText = tagText + "<a href='#'>" + i + "</a></li>"
//       $p.append(tagText);
//     };
//   };

  self.goToPage = function(num) {
    self.currentPage(num);
    self.currentPhoto(null);
    self.currentPageContent( self.currentAlbumContent()[num - 1] );
  };

  self.goToFirstPage = function() {
    self.goToPage(1);
  };

  self.goToLastPage = function() {
    self.goToPage(self.pageCount());
  };

  self.goToPreviousPage = function() {
    if (self.currentPage() > 1) {
      self.goToPage(self.currentPage() - 1)
    } else {
      self.goToFirstPage()
    }
  };

  self.goToNextPage = function() {
    if (self.currentPage() < self.pageCount()) {
      self.goToPage(self.currentPage() + 1);
    } else {
      self.goToLastPage();
    };
  };

  // photos
  function Photo (data) {
    this.id = data.id;
    var url = 'http://farm' + data.farm + '.static.flickr.com/' + data.server + '/' + data.id + '_' + data.secret;
    this.url = url + '.jpg';
    this.previewUrl = url + '_m.jpg';
    this.title = data.title;
  }

  self.currentPhoto = ko.observable();
  self.sortOrder = ko.observable('descending');

  self.loadPreview = function(element, index) {
    $("#" + index.id).attr('src', index.previewUrl);
  };

  self.loadPhoto = function(photo) {
    self.currentPageContent(null);
    self.currentPhoto(photo);
  };

  self.sortPhotosByTitle = function() {
    var direction;
    if (self.sortOrder() === 'ascending') {
      direction = 1;
      self.sortOrder('descending');
    } else {
      direction = -1;
      self.sortOrder('ascending');
    }
    this.items = self.currentAlbumContent();
    this.items.sort(function(a, b) {
      return a.title < b.title ? -direction : direction;
    });
    self.currentAlbumContent(this.items);
    self.goToPage(self.currentPage());
  };

  // init
  self.getUserInfo();
  self.getAlbumsList();
};


var flickrAppViewModel = new FlickrAppViewModel();
ko.applyBindings(flickrAppViewModel);
