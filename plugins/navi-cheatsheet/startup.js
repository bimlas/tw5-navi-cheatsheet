/*\
title: $:/plugins/bimlas/navi-cheatsheet/startup.js
type: application/javascript
module-type: startup

Extract Navi cheatsheets to specified path

\*/
(function () {

    /*jslint node: true, browser: false */
    /*global $tw: true */
    "use strict";

    // Export name and synchronous status
    exports.name = "navi-cheatsheet";
    exports.platforms = ["node"];
    exports.after = ["story"];
    exports.synchronous = false;

    exports.startup = function () {
        var logger = new $tw.utils.Logger(exports.name);
        var fs = require("fs");
        var os = require("os");

        $tw.wiki.addEventListener("change", function (changedTiddlers) {
            var blockIdentifier = "navi"

            if (!Object.keys(changedTiddlers).reduce(hasTiddlerWithCheatsheet, false)) {
                return;
            }

            var cheatsheet = $tw.wiki
                .filterTiddlers("[all[tiddlers]!is[shadow]!is[draft]search[@@" + blockIdentifier + ":]]")
                .map(extractCheatsheet)
                .reduce(flattenArray, [])
                .join("\n\n");
            var filepath = $tw.wiki
                .getTiddlerText("$:/config/bimlas/navi-cheatsheet/navi-file")
                .trim().replace("~", os.homedir);

            logger.log("Writing cheatsheet file: " + filepath);

            $tw.utils.createFileDirectories(filepath);
            fs.writeFileSync(filepath, cheatsheet, "utf8");

            function hasTiddlerWithCheatsheet(results, title) {
                if (changedTiddlers[title].deleted) {
                    return results;
                }
                var tiddler = $tw.wiki.getTiddler(title);
                var containsCheatsheet = tiddler.fields.text.search("@@" + blockIdentifier + ":") >= 0;
                var isDraft = tiddler.hasField("draft.of");
                return results || (!isDraft && containsCheatsheet);
            }

            function extractCheatsheet(tiddler) {
                return $tw.wiki
                    .parseTextReference(tiddler, "text", undefined, {}).tree
                    .filter(isCodeblock)
                    .filter(isCheatsheetBlock)
                    .map(convertToCheatsheetFormat);
            }

            function flattenArray(results, current) {
                return results.concat(current);
            }

            function isCodeblock(block) {
                return block.type === "codeblock";
            }

            function isCheatsheetBlock(codeblock) {
                return $tw.utils.hop(codeblock.attributes, "style")
                    && codeblock.attributes.style.value.startsWith(blockIdentifier + ":");
            }

            function convertToCheatsheetFormat(elem) {
                var regexp = new RegExp(blockIdentifier + ":\\s*(.*);")
                return "% " + elem.attributes.style.value.replace(regexp, "$1")
                    + "\n\n"
                    + elem.attributes.code.value;
            }
        });
    };
})();