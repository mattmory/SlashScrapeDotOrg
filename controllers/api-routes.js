
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");




mongoose.connect('mongodb://localhost/SlashScrapeDB');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connect to DB");
});

var storySchema = new mongoose.Schema({
  id: String,
  title: String,
  link: String,
  saved: Boolean,
  comments: String
});
var storyItem = mongoose.model("Stories", storySchema);

// =============================================================
module.exports = function (app) {

  // Main line into the application
  app.get("/", function (req, res) {
    var storiesArray = [];
    var allItemsQuery = storyItem.find({});
    allItemsQuery.exec(function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        docs.forEach(function (story) {
          storiesArray.push({ id: story.id, title: story.title, link: story.link, saved: story.saved })
        });
      }
      var stories = { stories: JSON.parse(JSON.stringify(storiesArray)) };
      res.render("index", stories);
    });
  });

  app.get("/favorites", function (req, res) {
    var storiesArray = [];
    var favoritesQuery = storyItem.find({ saved: true });
    favoritesQuery.exec(function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        docs.forEach(function (story) {
          storiesArray.push({ id: story.id, title: story.title, link: story.link, saved: story.saved })
        });
      }
      if (storiesArray.length > 0) {
        var stories = { stories: JSON.parse(JSON.stringify(storiesArray)) };
        res.render("favorites", stories);
      }
      else {
        res.render("nofavorites");
      }
    });
  });

  app.get("/search/:search", function (req, res) {
    var regex = new RegExp(req.params.search, "i");
    var searchQuery = storyItem.find({ title: regex });
    var storiesArray = [];
    searchQuery.exec(function (err, docs) {
      if (err) {
        console.log(err);
      }
      else {
        docs.forEach(function (story) {
          storiesArray.push({ id: story.id, title: story.title, link: story.link, saved: story.saved })
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

  app.get("/scrape", function (req, res) {
    var newStories = 0;
    request("http://www.slashdot.org", function (error, response, html) {
      var $ = cheerio.load(html);
      $("span.story-title").each(function (i, element) {
        var link = "http:" + $(element).children().attr("href");
        var title = $(element).children().text();
        var id = $(element).attr("id");
        var findItemByID = storyItem.findOne({ id: id });
        findItemByID.exec(function (err, docs) {
          if (err) { console.log(err) }
          else {
            if (docs === null) {
              newStories++;
              var newStory = new storyItem({ id: [id], title: [title], link: [link], saved: false, comments: null });
              newStory.save(function (err, result) {
                if (err) return console.error(err);
              });
            }
          }
        });
      });
      res.send("Loaded");
    });
  });

};



// app.get("/scrape", function (req, res) {
//   var newStories = 0;
//   request("http://www.slashdot.org", function (error, response, html) {
//     var $ = cheerio.load(html);
//     $("span.story-title").each(function (i, element) {
//       var link = "http:" + $(element).children().attr("href");
//       var title = $(element).children().text();
//       var id = $(element).attr("id");
//       var findItemByID = storyItem.findOne({ id: id });
//       findItemByID.exec(function (err, docs) {
//         if (err) { console.log(err) }
//         else {
//           if (docs === null) {
//             newStories++;
//             console.log("Adding a new one");
//             var newStory = new storyItem({ id: [id], title: [title], link: [link], saved: false, comments: null });
//             newStory.save(function (err, result) {
//               if (err) return console.error(err);
//             });
//           }
//         }
//       });
//       console.log("Checking");
//     });
//     console.log(newStories);
//   //  res.send("The have been " + newStories + " new stories added");
//   });

// });