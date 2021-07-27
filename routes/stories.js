const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
//Image
const { storage } = require("../cloudinary");
const multer = require("multer");
const upload = multer({ storage });

const Story = require("../models/Story");

router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

router.post("/", ensureAuth, upload.single("image"), async (req, res) => {
  try {
    const story = new Story(req.body);
   
    (story.img.url = req.file.path), (story.img.filename = req.file.filename);
    story.user = req.user.id;

    await story.save();
    res.redirect("/dashboard");
  } catch (err) {
    console.error(err);
    res, render("error/500");
  }
});

router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();

    res.render("stories/index", { stories });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate("user").lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user._id != req.user.id && story.status == "private") {
      res.render("error/404");
    } else {
      res.render("stories/show", {
        story,
      });
    }
  } catch (err) {
    console.error(err);
    res.render("error/404");
  }
});

//     Show edit page
//   GET /stories/edit/:id
router.get("/edit/:id", ensureAuth, async (req, res) => {
  try {
    const story = await Story.findOne({
      _id: req.params.id,
    }).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      res.render("stories/edit", {
        story,
      });
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

//     Update story
//    PUT /stories/:id
router.put("/:id", ensureAuth, async (req, res) => {
  try {
    const { id } = req.params;
    let story = await Story.findById(id).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      story = await Story.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      
      await story.save();
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

//     Delete story
//    DELETE /stories/:id
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).lean();

    if (!story) {
      return res.render("error/404");
    }

    if (story.user != req.user.id) {
      res.redirect("/stories");
    } else {
      await Story.remove({ _id: req.params.id });
      res.redirect("/dashboard");
    }
  } catch (err) {
    console.error(err);
    return res.render("error/500");
  }
});

//    User stories
//   GET /stories/user/:userId
router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: "public",
    })
      .populate("user")
      .lean();

    res.render("stories/index", {
      stories,
    });
  } catch (err) {
    console.error(err);
    res.render("error/500");
  }
});

module.exports = router;
