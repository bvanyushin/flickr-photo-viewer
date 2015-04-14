function ViewModel() {
  var self = this;

  function Album(data) {
    this.id = data.id;
    this.title = data.title._content;
  }

  function Photo (data) {
    this.id = data.id;
    this.url = 'http://farm' + data.farm + '.static.flickr.com/' + data.server + '/' + data.id + '_' + data.secret + '.jpg';
    this.previewUrl = 'http://farm' + data.farm + '.static.flickr.com/' + data.server + '/' + data.id + '_' + data.secret + '_m.jpg';
  }

  self.albums = ko.observableArray([]);
  self.chosenAlbumID = ko.observable();
  self.chosenAlbumPhotos = ko.observable();
  self.chosenPhoto = ko.observable();

  self.getAlbums = function() {
    var apiUrl = "https://api.flickr.com/services/rest/?";
    var user = "43266322@N06";
    var method = "flickr.photosets.getList";
    var apiKey = "82aa4c342525ac3bf02945d35a2e1c7b";
    var apiUrl = apiUrl + "method=" + method + "&api_key=" + apiKey + "&user_id=" + user + "&format=json&nojsoncallback=1";

    $.getJSON(apiUrl, function(allData) {
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
    var apiUrl = "https://api.flickr.com/services/rest/?";
    var user = "43266322@N06";
    var method = "flickr.photosets.getPhotos";
    var apiKey = "82aa4c342525ac3bf02945d35a2e1c7b";
    var apiUrl = apiUrl + "method=" + method + "&api_key=" + apiKey + "&photoset_id=" + self.chosenAlbumID().id + "&user_id=" + user + "&format=json&nojsoncallback=1";
    $.getJSON(apiUrl, function(allData) {
      var mappedPhotos = $.map(allData.photoset.photo, function(item) { return new Photo(item) });
      self.chosenAlbumPhotos(mappedPhotos);
    }); 
  }

  self.loadPreview = function(element, index, data) {
    $("#" + index.id).attr('src', index.previewUrl);
  };

  self.loadPhoto = function(element, index, data) {
    $("#" + index.id).attr('src', index.url);
  };

  self.getAlbums();
};


viewModel = new ViewModel;
ko.applyBindings(viewModel)