/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2016 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/base/Object','./library','./TableExtension','./TableUtils'],function(q,B,l,T,a){"use strict";var C=a.CELLTYPES;var H=5;var b=B.extend("sap.ui.table.TableKeyboardDelegate2",{constructor:function(t){B.call(this);},destroy:function(){B.prototype.destroy.apply(this,arguments);},getInterface:function(){return this;}});b._restoreFocusOnLastFocusedDataCell=function(t,e){var i=a.getFocusedItemInfo(t);var L=t._getKeyboardExtension()._getLastFocusedCellInfo();a.focusItem(t,i.cellInRow+(i.columnCount*L.row),e);};b._setFocusOnColumnHeaderOfLastFocusedDataCell=function(t,e){var i=a.getFocusedItemInfo(t);a.focusItem(t,i.cellInRow,e);};b._forwardFocusToTabDummy=function(t,s){t._getKeyboardExtension()._setSilentFocus(t.$().find("."+s));};b.prototype.onfocusin=function(e){if(e.isMarked("sapUiTableIgnoreFocusIn")){return;}var t=q(e.target);if(t.hasClass("sapUiTableOuterBefore")||t.hasClass("sapUiTableOuterAfter")||(e.target!=this.getDomRef("overlay")&&this.getShowOverlay())){this.$("overlay").focus();}else if(t.hasClass("sapUiTableCtrlBefore")){var n=a.isNoDataVisible(this);if(!n||n&&this.getColumnHeaderVisible()){b._setFocusOnColumnHeaderOfLastFocusedDataCell(this,e);}else{this._getKeyboardExtension()._setSilentFocus(this.$("noDataCnt"));}}else if(t.hasClass("sapUiTableCtrlAfter")){if(!a.isNoDataVisible(this)){b._restoreFocusOnLastFocusedDataCell(this,e);}}};b.prototype.onsaptabnext=function(e){var i=a.getCellInfo(e.target)||{};if(i.type===C.COLUMNHEADER||i.type===C.COLUMNROWHEADER){if(a.isNoDataVisible(this)){this.$("noDataCnt").focus();}else{b._restoreFocusOnLastFocusedDataCell(this,e);}e.preventDefault();}else if(i.type===C.DATACELL||i.type===C.ROWHEADER){b._forwardFocusToTabDummy(this,"sapUiTableCtrlAfter");}else if(e.target===this.getDomRef("overlay")){this._getKeyboardExtension()._setSilentFocus(this.$().find(".sapUiTableOuterAfter"));}};b.prototype.onsaptabprevious=function(e){var i=a.getCellInfo(e.target)||{};if(i.type===C.DATACELL||i.type===C.ROWHEADER||e.target===this.getDomRef("noDataCnt")){if(this.getColumnHeaderVisible()){b._setFocusOnColumnHeaderOfLastFocusedDataCell(this,e);e.preventDefault();}else{b._forwardFocusToTabDummy(this,"sapUiTableCtrlBefore");}}else if(e.target===this.getDomRef("overlay")){this._getKeyboardExtension()._setSilentFocus(this.$().find(".sapUiTableOuterBefore"));}};b.prototype.onsapdown=function(e){var i=a.getCellInfo(e.target)||{};if(i.type===C.DATACELL||i.type===C.ROWHEADER){if(a.isLastScrollableRow(this,e.target)){var s=a.scroll(this,true,false);if(s){e.setMarked("sapUiTableSkipItemNavigation");}}}else if(i.type===C.COLUMNHEADER||i.type===C.COLUMNROWHEADER){var h=a.getHeaderRowCount(this);if(a.isNoDataVisible(this)){var f=a.getFocusedItemInfo(this);if(f.row-h<=1){e.setMarked("sapUiTableSkipItemNavigation");}}else if(i.type===C.COLUMNROWHEADER&&h>1){e.setMarked("sapUiTableSkipItemNavigation");a.focusItem(this,h*(a.getVisibleColumnCount(this)+1),e);}}};b.prototype.onsapup=function(e){var i=a.getCellInfo(e.target)||{};if(i.type===C.DATACELL||i.type===C.ROWHEADER){if(a.isFirstScrollableRow(this,e.target)){var s=a.scroll(this,false,false);if(s){e.setMarked("sapUiTableSkipItemNavigation");}}}};b.prototype.onsaphome=function(e){if(a.isInGroupingRow(e.target)){e.setMarked("sapUiTableSkipItemNavigation");return;}var c=a.getCellInfo(e.target)||{};if(c.type===C.DATACELL||c.type===C.COLUMNHEADER){var f=a.getFocusedItemInfo(this);var F=f.cell;var i=f.cellInRow;var h=a.hasRowHeader(this);var r=h?1:0;if(a.hasFixedColumns(this)&&i>this.getFixedColumnCount()+r){e.setMarked("sapUiTableSkipItemNavigation");a.focusItem(this,F-i+this.getFixedColumnCount()+r,null);}else if(h&&i>1){e.setMarked("sapUiTableSkipItemNavigation");a.focusItem(this,F-i+r,null);}}};b.prototype.onsapend=function(e){if(a.isInGroupingRow(e.target)){e.setMarked("sapUiTableSkipItemNavigation");return;}var c=a.getCellInfo(e.target)||{};if(c.type===C.DATACELL||c.type===C.ROWHEADER||c.type===C.COLUMNHEADER||c.type===C.COLUMNROWHEADER){var f=a.getFocusedItemInfo(this);var F=f.cell;var i=f.cellInRow;var h=a.hasRowHeader(this);var r=h?1:0;var I=false;if(c.type===C.COLUMNHEADER&&a.hasFixedColumns(this)){var d=c.cell.data('sap-ui-colspan');if(d>1&&i+d-r===this.getFixedColumnCount()){I=true;}}if(h&&i===0){e.setMarked("sapUiTableSkipItemNavigation");a.focusItem(this,F+1,null);}else if(a.hasFixedColumns(this)&&i<this.getFixedColumnCount()-1+r&&!I){e.setMarked("sapUiTableSkipItemNavigation");a.focusItem(this,F+this.getFixedColumnCount()-i,null);}}};b.prototype.onsaphomemodifiers=function(e){if(e.metaKey||e.ctrlKey){var c=a.getCellInfo(e.target)||{};if(c.type===C.DATACELL||c.type===C.ROWHEADER||c.type===C.COLUMNHEADER){e.setMarked("sapUiTableSkipItemNavigation");var f=a.getFocusedItemInfo(this);var F=f.row;if(F>0){var i=f.cell;var d=f.columnCount;var h=a.getHeaderRowCount(this);if(F<h+this.getFixedRowCount()){a.focusItem(this,i-d*F,e);}else if(F>=h+this.getFixedRowCount()&&F<h+a.getNonEmptyVisibleRowCount(this)-this.getFixedBottomRowCount()){a.scrollMax(this,false);if(this.getFixedRowCount()>0){a.focusItem(this,i-d*(F-h),e);}else{a.focusItem(this,i-d*F,e);}}else{a.scrollMax(this,false);a.focusItem(this,i-d*(F-h-this.getFixedRowCount()),e);}}}}};b.prototype.onsapendmodifiers=function(e){if(e.metaKey||e.ctrlKey){var c=a.getCellInfo(e.target)||{};if(c.type===C.DATACELL||c.type===C.ROWHEADER||c.type===C.COLUMNHEADER||c.type===C.COLUMNROWHEADER){e.setMarked("sapUiTableSkipItemNavigation");var f=a.getFocusedItemInfo(this);var F=f.row;var h=a.getHeaderRowCount(this);var n=a.getNonEmptyVisibleRowCount(this);if(this.getFixedBottomRowCount()===0||F<h+n-1||(a.isNoDataVisible(this)&&F<h-1)){var i=f.cell;var d=f.columnCount;if(a.isNoDataVisible(this)){a.focusItem(this,i+d*(h-F-1),e);}else if(F<h){if(this.getFixedRowCount()>0){a.focusItem(this,i+d*(h+this.getFixedRowCount()-F-1),e);}else{a.scrollMax(this,true);a.focusItem(this,i+d*(h+n-this.getFixedBottomRowCount()-F-1),e);}}else if(F>=h&&F<h+this.getFixedRowCount()){a.scrollMax(this,true);a.focusItem(this,i+d*(h+n-this.getFixedBottomRowCount()-F-1),e);}else if(F>=h+this.getFixedRowCount()&&F<h+n-this.getFixedBottomRowCount()){a.scrollMax(this,true);a.focusItem(this,i+d*(h+n-F-1),e);}else{a.focusItem(this,i+d*(h+n-F-1),e);}}}}};b.prototype.onsappageup=function(e){var c=a.getCellInfo(e.target)||{};if(c.type===C.DATACELL||c.type===C.ROWHEADER||c.type===C.COLUMNHEADER){var f=a.getFocusedItemInfo(this);var F=f.row;var h=a.getHeaderRowCount(this);if(this.getFixedRowCount()===0&&F>=h||this.getFixedRowCount()>0&&F>h){e.setMarked("sapUiTableSkipItemNavigation");var i=f.cell;var d=f.columnCount;if(F<h+this.getFixedRowCount()){a.focusItem(this,i-d*(F-h),e);}else if(F===h+this.getFixedRowCount()){var p=a.getNonEmptyVisibleRowCount(this)-this.getFixedRowCount()-this.getFixedBottomRowCount();var r=this._getSanitizedFirstVisibleRow();a.scroll(this,false,true);if(r<p){if(this.getFixedRowCount()>0){a.focusItem(this,i-d*(F-h),e);}else{a.focusItem(this,i-d*h,e);}}}else if(F>h+this.getFixedRowCount()&&F<h+a.getNonEmptyVisibleRowCount(this)){a.focusItem(this,i-d*(F-h-this.getFixedRowCount()),e);}else{a.focusItem(this,i-d*(F-h-a.getNonEmptyVisibleRowCount(this)+1),e);}}}};b.prototype.onsappagedown=function(e){var c=a.getCellInfo(e.target)||{};if(c.type===C.DATACELL||c.type===C.ROWHEADER||c.type===C.COLUMNHEADER||c.type===C.COLUMNROWHEADER){e.setMarked("sapUiTableSkipItemNavigation");var f=a.getFocusedItemInfo(this);var F=f.row;var h=a.getHeaderRowCount(this);var n=a.getNonEmptyVisibleRowCount(this);if((a.isNoDataVisible(this)&&F<h-1)||this.getFixedBottomRowCount()===0||F<h+n-1){var i=f.cell;var d=f.columnCount;if(F<h-1&&c.type!==C.COLUMNROWHEADER){a.focusItem(this,i+d*(h-F-1),e);}else if(F<h){if(!a.isNoDataVisible(this)){a.focusItem(this,i+d*(h-F),e);}}else if(F>=h&&F<h+n-this.getFixedBottomRowCount()-1){a.focusItem(this,i+d*(h+n-this.getFixedBottomRowCount()-F-1),e);}else if(F===h+n-this.getFixedBottomRowCount()-1){var p=a.getNonEmptyVisibleRowCount(this)-this.getFixedRowCount()-this.getFixedBottomRowCount();var r=this._getRowCount()-this.getFixedBottomRowCount()-this._getSanitizedFirstVisibleRow()-p*2;a.scroll(this,true,true);if(r<p&&this.getFixedBottomRowCount()>0){a.focusItem(this,i+d*(h+n-F-1),e);}}else{a.focusItem(this,i+d*(h+n-F-1),e);}}}};b.prototype.onsappageupmodifiers=function(e){if(e.altKey){var c=a.getCellInfo(e.target)||{};if(c.type===C.DATACELL||c.type===C.COLUMNHEADER){var f=a.getFocusedItemInfo(this);var F=f.cell;var i=f.cellInRow;var h=a.hasRowHeader(this);var r=h?1:0;var p=H;e.setMarked("sapUiTableSkipItemNavigation");if(h&&(a.isInGroupingRow(e.target)||i===1)){a.focusItem(this,F-i,null);}else if(i-r<p){a.focusItem(this,F-i+r,null);}else{a.focusItem(this,F-p,null);}}}};b.prototype.onsappagedownmodifiers=function(e){if(e.altKey){var c=a.getCellInfo(e.target)||{};if(c.type===C.DATACELL||c.type===C.ROWHEADER||c.type===C.COLUMNHEADER||c.type===C.COLUMNROWHEADER){var f=a.getFocusedItemInfo(this);var F=f.cellInRow;var h=a.hasRowHeader(this);var r=h?1:0;var v=a.getVisibleColumnCount(this);var i=c.cell.data('sap-ui-colspan')||1;e.setMarked("sapUiTableSkipItemNavigation");if(F+i-r<v){var d=f.cell;var p=H;if(h&&F===0){a.focusItem(this,d+1,null);}else if(a.isInGroupingRow(e.target)){}else if(i>p){a.focusItem(this,d+i,null);}else if(F+i-r+p>v){a.focusItem(this,d+v-F-1+r,null);}else{a.focusItem(this,d+p,null);}}}}};return b;});
