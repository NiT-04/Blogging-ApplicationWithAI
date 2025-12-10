const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,   // fixed typo
    },
    body: {
      type: String,
      required: true,
    },
    coverImageURL: {
      type: String,
      required: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },

    // ⭐ NEW FIELDS FOR AI FEATURES ⭐

    summary: {
      type: String,
      default: "",
    },

    tagsAI: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model("blog", blogSchema);
module.exports = Blog;
