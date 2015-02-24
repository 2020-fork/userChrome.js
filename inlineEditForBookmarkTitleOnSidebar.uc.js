// ==UserScript==
// @name          inlineEditForBookmarkTitleOnSidebar.uc.js
// @namespace     http://space.geocities.yahoo.co.jp/gl/alice0775
// @description   サイドバーにおいてブックマークのタイトルを直接編集できるようにする
// @include       chrome://browser/content/bookmarks/bookmarksPanel.xul
// @compatibility Firefox 10-
// @author        Alice0775
// @version        2015/02/08 22:30 Fixed strictmode
// @version        2012/12/08 22:30 Bug 788290 Bug 788293 Remove E4X 
// @version        2012/08/12 22:30 Bug 761723 implement toString of function objects by saving source
// ==/UserScript==
// @version       2012/02/06 編集終了Enterでブックマークが開かないように
// @version       2012/02/06
// @note          ツリーの左端をF2またはダブルクリックでブックマークのタイトルの編集開始
// @note          ブックマークフォルダはF2でタイトルの編集開始

var inlineEditForBookmarkTitleOnSidebar = {

  get _BTree() {
    delete this._BTree
    return this._BTree = document.getElementById("bookmarks-view");
  },

  init: function(){
    if (!this._BTree)
      return;

    var func = SidebarUtils.handleTreeKeyPress.toString();
    func = func.replace(
      'let tree = aEvent.target;',
    ' \
      $& \
      tree = aEvent.target.parentNode; \
      if (tree.editing) \
        return; \
    '
    );
    //Replace function
    SidebarUtils.handleTreeKeyPress = new Function(
         func.match(/\(([^)]*)/)[1],
         func.replace(/[^{]*/, '').replace(/^{/, '').replace(/}$/, '')
    );

    this._BTree.setAttribute('editable', true);
    this._BTree.addEventListener('keypress', this, false);
    window.addEventListener('unload', this, false);
  },

  uninit: function(){
    if (!this._BTree)
      return;

    this._BTree.removeEventListener('keypress', this, false);
    window.removeEventListener('unload', this, false);
    this._BTree = null;
  },

  keypress: function(event) {
    if (event.keyCode != KeyEvent.DOM_VK_F2)
      return;

    var tree = event.target;
    if (tree.disabled)
      return;

    var b = tree.treeBoxObject;
    var row = b.view.selection.currentIndex;
    var col = tree.columns[0];

    if (row == -1)
      return;

    if (tree.editable)
      if (tree.startEditing(row, col))
        event.preventDefault();
  },

  handleEvent: function(event) {
    switch (event.type) {
      case "keypress":
        this.keypress(event);
        break;
      case "unload":
        this.uninit();
        break;
       
    }
  },

  debug: function(aMsg){
    Components.classes["@mozilla.org/consoleservice;1"]
      .getService(Components.interfaces.nsIConsoleService)
      .logStringMessage(aMsg);
  }

}

inlineEditForBookmarkTitleOnSidebar.init();
