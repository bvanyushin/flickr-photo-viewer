function FlickrAppViewModel() {
  var self = this;

  function Album(data) {
    this.id = data.id;
    this.title = data.title._content;
    this.description = data.description._content;
  }

  function Photo (data) {
    this.id = data.id;
    var url = 'http://farm' + data.farm + '.static.flickr.com/' + data.server + '/' + data.id + '_' + data.secret;
    this.url = url + '.jpg';
    this.previewUrl = url + '_m.jpg';
    this.title = data.title;
  }

  var apiUrl = "https://api.flickr.com/services/rest/?";
  var user = "43266322@N06";
  var apiKey = "82aa4c342525ac3bf02945d35a2e1c7b";
  var callbackFormat = "&format=json&nojsoncallback=1";
  
  // albums
  self.albums = ko.observableArray([]);
  self.currentAlbum = ko.observable();
  self.currentAlbumContent = ko.observableArray([]);

  self.getAlbumsList = function() {
    var method = "flickr.photosets.getList";
    var callUrl = apiUrl + "method=" + method + "&api_key=" + apiKey + "&user_id=" + user + callbackFormat;

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
    var callUrl = apiUrl + "method=" + method + "&api_key=" + apiKey + "&photoset_id=" + self.currentAlbum().id + "&user_id=" + user + callbackFormat;
    $.getJSON(callUrl, function(allData) {
      var mappedPhotos = $.map(allData.photoset.photo, function(item) { return new Photo(item) });
      self.currentAlbumContent(mappedPhotos);
      self.goToPage(1);
    });
  };

  // photos

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

  // pages

  self.pageCount = ko.pureComputed(function() {
    return Math.ceil( self.currentAlbumContent().length / self.photosPerPage() );
  });
  self.currentPage = ko.observable();
  self.currentPageContent = ko.observableArray([]);
  self.photosPerPage = ko.observable(9);
  self.pageSizesCollection = [3, 6, 9, 12];

  self.photosPerPage.subscribe(function() {
    self.goToFirstPage();
  });

  self.goToPage = function(num) {
    self.currentPage(num);
    self.currentPhoto(null);
    self.getCurrentPageContent();
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

  self.getCurrentPageContent = function() {
    var fromIndex = (self.currentPage() - 1) * self.photosPerPage();
    var toIndex = fromIndex + self.photosPerPage();
    self.currentPageContent(self.currentAlbumContent().slice(fromIndex, toIndex));
  };

  // init
  self.getAlbumsList();
};


var flickrAppViewModel = new FlickrAppViewModel();
ko.applyBindings(flickrAppViewModel);
