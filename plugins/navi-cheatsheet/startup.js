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
    exports.after = ["startup"];
    exports.false = true;

    exports.startup = function() {
        console.log('LOADED');
        $tw.wiki.addEventListener("change", function (changedTiddlers) {
            console.log('Changed tiddlers are:', changedTiddlers);
        });
    };

})();