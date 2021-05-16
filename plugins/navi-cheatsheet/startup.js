/*\
title: $:/plugins/bimlas/navi-cheatsheet/startup.js
type: application/javascript
module-type: startup

Extract Navi cheatsheets to proper format

\*/
(function() {

    /*jslint node: true, browser: false */
    /*global $tw: true */
    "use strict";

    // Export name and synchronous status
    exports.name = "navi-cheatsheet";
    exports.platforms = ["node"];
    exports.after = ["story"];
    exports.synchronous = false;

    exports.startup = function() {
        var
            logger = new $tw.utils.Logger(exports.name),
            fs = require("fs"),
		    os = require("os");

        $tw.wiki.addEventListener("change", function (changedTiddlers) {
            var hasModifiedCheatsheet = Object.keys(changedTiddlers)
                // TODO Filter drafts
                .reduce(function(results, tiddler) { return results || (!changedTiddlers[tiddler].deleted && tiddlerContainsCheatsheet(tiddler)) }, false);

            if (!hasModifiedCheatsheet) {
                return;
            }

            logger.log("Generating cheatsheet file");

            var cheatsheet = $tw.wiki.filterTiddlers("[all[tiddlers]!is[draft]search[@@navi]]")
                .map(function(tiddler) { return extractCheatsheet(tiddler) })
                .join("\n\n");

            var filepath = $tw.wiki.getTiddler("$:/config/bimlas/navi-cheatsheet/navi-file").fields.text.trim().replace("~", os.homedir);
            $tw.utils.createFileDirectories(filepath);
            fs.writeFileSync(filepath,cheatsheet,"utf8");
        });
    };

    function tiddlerContainsCheatsheet(tiddler) {
        return $tw.wiki.getTiddler(tiddler).fields.text.search("@@navi") >= 0;
    }

    function extractCheatsheet(tiddler) {
        return $tw.wiki.parseTextReference(tiddler, "text", undefined, {}).tree
            .filter(function(block) { return block.type === "codeblock" })
            .filter(function(codeblock) { return $tw.utils.hop(codeblock.attributes, "style") && codeblock.attributes.style.value.startsWith("navi:") })
            .map(function(current) { return "% " + current.attributes.style.value.replace(/navi:\s*(.*);/, "$1") + "\n\n" + current.attributes.code.value })
            .join("\n\n");
    }

})();