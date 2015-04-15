function FlickrAppViewModel() {
  var self = this;

  function Album(data) {
    this.id = data.id;
    this.title = data.title._content;
    this.description = data.description._content;
  }

  function Photo (data) {
    this.id = data.id;
    this.url = 'http://farm' + data.farm + '.static.flickr.com/' + data.server + '/' + data.id + '_' + data.secret + '.jpg';
    this.previewUrl = 'http://farm' + data.farm + '.static.flickr.com/' + data.server + '/' + data.id + '_' + data.secret + '_m.jpg';
    this.title = data.title;
  }

  self.albums = ko.observableArray([]);
  self.chosenAlbumID = ko.observable();
  self.chosenAlbumPhotos = ko.observableArray([]);
  self.chosenPhoto = ko.observable();

  var apiUrl = "https://api.flickr.com/services/rest/?";
  var user = "43266322@N06";
  var apiKey = "82aa4c342525ac3bf02945d35a2e1c7b";
  
  self.getAlbums = function() {
    var method = "flickr.photosets.getList";
    var callUrl = apiUrl + "method=" + method + "&api_key=" + apiKey + "&user_id=" + user + "&format=json&nojsoncallback=1";

    $.getJSON(callUrl, function(allData) {
      var mappedAlbums = $.map(allData.photosets.photoset, function(item) { return new Album(item) });
      self.albums(mappedAlbums);
      self.goToAlbum(mappedAlbums[0]);
    });
  }

  self.goToAlbum = function (album) {
    self.chosenAlbumID(album);
    self.chosenPhoto(null);
    self.getAlbumPhotos();
  }

  self.getAlbumPhotos = function () {
    var method = "flickr.photosets.getPhotos";
    var callUrl = apiUrl + "method=" + method + "&api_key=" + apiKey + "&photoset_id=" + self.chosenAlbumID().id + "&user_id=" + user + "&format=json&nojsoncallback=1";
    $.getJSON(callUrl, function(allData) {
      var mappedPhotos = $.map(allData.photoset.photo, function(item) { return new Photo(item) });
      self.chosenAlbumPhotos(mappedPhotos);
    }); 
  }

  self.loadPreview = function(element, index, data) {
    $("#" + index.id).attr('src', index.previewUrl);
  };

  self.loadPhoto = function(photo) {
    self.chosenAlbumPhotos(null);
     self.chosenPhoto(photo);
  };

  self.sortPhotosByTitle = function() {
    this.items = self.chosenAlbumPhotos();
    this.items.sort(function(a, b) {
      return a.title < b.title ? -1 : 1;
    });
    self.chosenAlbumPhotos(this.items);
  }

  self.getAlbums();
};


flickrAppViewModel = new FlickrAppViewModel;
ko.applyBindings(flickrAppViewModel);
