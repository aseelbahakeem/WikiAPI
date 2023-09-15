const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect("mongodb://0.0.0.0:27017/wikiDB", { useNewUrlParser: true, useUnifiedTopology: true });
}

const articleSchema = {
    title: String,
    content: String
};

const Article = mongoose.model("Article", articleSchema);

app.route("/articles")

    .get(async (req, res) => {
        await Article.find().then(foundArticles => {
            res.send(foundArticles);
        })
            .catch(err => {
                console.log(err);
            });
    })

    .post(function (req, res) {
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });
        newArticle.save().then(() => {
            console.log("Successfully added to a new article.");
            res.redirect("/");
        })
            .catch(err => {
                res.status(400).send("Unable to save article to database.")
            });
    })

    .delete(function (req, res) {
        Article.deleteMany({})
            .then(() => {
                res.send("Successfully deleted all the articles.")
            })
            .catch(err => {
                console.log(err);
            });
    });


app.route("/articles/:articleTitle")

    .get(function (req, res) {
        Article.findOne({ title: req.params.articleTitle }).then((foundArticle) => {
            res.send(foundArticle.content);
        })
            .catch(err => {
                res.send(err);
            })
    })

    .put(async (req, res) => {
        try {
            const { articleTitle } = req.params;
            const { title, content } = req.body;

            const result = await Article.replaceOne(
                { title: req.params.articleTitle },
                { title: req.body.title, content: req.body.content },
                { overwrite: true },

            );
            if (result.modifiedCount === 1) {
                res.send("Success");
            } else {
                res.send(`Article '${articleTitle}' not found`);
            }
        } catch (err) {
            res.status(500).send(err.message);
        };

    })

    .patch(async (req, res) => {
        Article.updateOne(
            { title: req.params.articleTitle },
            { $set: req.body },

        )
            .then(() => {
                res.send("Successfully updated the selected articles.")
            })
            .catch(err => {
                console.log(err);
            });
    })

    .delete(async (req, res) => {
        Article.deleteOne(
            { title: req.params.articleTitle }
        )
            .then(() => {
                res.send("Successfully deleted the corresponding articles.")
            })
            .catch(err => {
                console.log(err);
            });
    });


app.listen(3000, function () {
    console.log("Server started on port 3000");
});