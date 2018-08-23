
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
    var storiesArray = [];
    db.Story.find({ $text: { $search: regex } })
      .then(function (docs) {

        docs.forEach(function (story) {
          storiesArray.push({ id: story.id, title: story.title, link: story.link, preview: story.preview, saved: story.saved })
        });

        if (storiesArray.length > 0) {
          var stories = { stories: JSON.parse(JSON.stringify(storiesArray)) };
          res.render("index", stories);
        }
        else {
          res.render("noresults");
        }
      })
      .catch (function (err) {
        console.log(err);
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
        res.status(200).end();
      }).catch(function (err) {
        throw err;
      })
  });


  app.post("/Story/:id", function (req, res) {
    // Create a new note and pass the req.body to the entry
    db.Comment.create(req.body)
      .then(function (dbComment) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Story.findOneAndUpdate({ id: req.params.id }, { comment: dbComment._id }, { new: true });
      })
      .then(function (dbStory) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbStory);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
};

