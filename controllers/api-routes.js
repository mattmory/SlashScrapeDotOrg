
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("../models");



// =============================================================
module.exports = function (app) {

  // Main line into the application
  app.get("/", function (req, res) {
    var storiesArray = [];
    var allItemsQuery = db.Story.find({}).sort({ scraptedAt: -1 });
    allItemsQuery.exec(function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        docs.forEach(function (story) {
          storiesArray.push({ id: story.id, title: story.title, link: story.link, preview: story.preview, saved: story.saved })
        });
      }

      var stories = { stories: JSON.parse(JSON.stringify(storiesArray)) };
      res.render("index", stories);

    });
  });

  app.get("/favorites", function (req, res) {
    var storiesArray = [];
    db.Story.find({ saved: true })
      .then(function (docs) {
        docs.forEach(function (story) {
          storiesArray.push({ id: story.id, title: story.title, link: story.link, preview: story.preview, saved: story.saved })
        });

        if (storiesArray.length > 0) {
          var stories = { stories: JSON.parse(JSON.stringify(storiesArray)) };
          res.render("favorites", stories);
        }
        else {
          res.render("nofavorites");
        }
      })
      .catch(function (err) {
        console.log(err);
      })
  })


  app.get("/search/:search", function (req, res) {
    var regex = new RegExp(req.params.search, "i");
    var searchQuery = db.Story.find({ title: regex });
    var storiesArray = [];
    searchQuery.exec(function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        docs.forEach(function (story) {
          storiesArray.push({ id: story.id, title: story.title, link: story.link, preview: story.preview, saved: story.saved })
        });
      }
      if (storiesArray.length > 0) {
        var stories = { stories: JSON.parse(JSON.stringify(storiesArray)) };
        res.render("index", stories);
      }
      else {
        res.render("noresults");
      }
    });
  });

  // Route to scrape it all
  app.get("/scrape", function (req, res) {
    var newStories = 0;
    axios("http://www.slashdot.org")
      .then(function (response) {
        var $ = cheerio.load(response.data);
        $("span.story-title").each(function (i, element) {
          var link = "http:" + $(element).children().attr("href");
          var title = $(element).children().text();
          var id = $(element).attr("id");
          var divTextString = "div#text-" + id.substring(6, id.length);
          var storyPreview = $(divTextString).text();
          db.Story.findOne({ id: id })
            .then(function (doc) {
              if (doc === null) {
                newStories++;
                return db.Story.create({ id: [id], title: [title], link: [link], saved: false, preview: [storyPreview] })
              }
              return;
            })
            .catch(function (err) {
              consoel.log(err);
            })
        });
      })
      .then(function () {
        res.send("Added " + newStories + " new stories.");
      }).catch(function (err) {
        console.log(err);
      });

  });


  // Route to update a favorite
  app.put("/favorites/:id", function (req, res) {
    var updateSaved = req.body.fav;
    db.Story.updateOne({ id: [req.params.id] }, { $set: { saved: updateSaved } }, { new: true })
      .then(function (docs) {
        console.log(docs);
        res.status(200).end();
      }).catch(function (err) {
        throw err;
      })
  });

};

// Route to remove a favorite

// app.get("/scrape", function (req, res) {
//   var newStories = 0;
//   axios("http://www.slashdot.org")
//     .then(function (response) {
//       var $ = cheerio.load(response.data);
//       $("span.story-title").each(function (i, element) {
//         var link = "http:" + $(element).children().attr("href");
//         var title = $(element).children().text();
//         var id = $(element).attr("id");
//         var divTextString = "div#text-" + id.substring(6, id.length);
//         var storyPreview = $(divTextString).text();
//         var findItemByID = storyItem.findOne({ id: id });
//         findItemByID.exec(function (err, docs) {
//           if (err) { console.log(err) }
//           else {
//             if (docs === null) {
//               newStories++;
//               var newStory = new storyItem({ id: [id], title: [title], link: [link], saved: false, preview: [storyPreview], comments: null });
//               newStory.save(function (err, result) {
//                 if (err) return console.error(err);
//               });
//             }
//           }
//         });
//       });
//     })
//     .then(function () {
//       res.send("Added "+ newStories + " new stories.");
//     }).catch(function (err) {
//       console.log(err);
//     });

// });