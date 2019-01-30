namespace com.keyman.dom {
  export class TextArea implements EditableElement {
    root: HTMLTextAreaElement;

    /**
     * Tracks the most recently-cached selection start index.
     */
    private _cachedSelectionStart: number

    /**
     * Tracks the most recently processed, extended-string-based selection start index.
     * When the element's selectionStart value changes, this should be invalidated.
     */
    private processedSelectionStart: number;

    /**
     * Tracks the most recently processed, extended-string-based selection end index.
     * When the element's selectionEnd value changes, this should be invalidated.
     */
    private processedSelectionEnd: number;

    /**
     * Used to temporarily store the y-axis scroll coordinate.
     */
    private scrollTop?: number;

    /**
     * Used to temporarily store the x-axis scroll coordinate.
     */
    private scrollLeft?: number;

    constructor(ele: HTMLTextAreaElement) {
      this.root = ele;
      this._cachedSelectionStart = -1;
    }

    getElement(): HTMLTextAreaElement {
      return this.root;
    }

    clearSelection(): void {
      // Processes our codepoint-based variants of selectionStart and selectionEnd.
      let caret = this.getCaret();
      this.root.value = this.root.value._kmwSubstring(0, caret) + this.root.value._kmwSubstring(this.processedSelectionEnd); //I3319

      this.setCaret(caret);
    }

    hasSelection(): boolean {
      return true;
    }

    invalidateSelection() {
      // Since .selectionStart will never return this value, we use it to indicate
      // the need to refresh our processed indices.
      this._cachedSelectionStart = -1;
    }

    getCaret(): number {
      if(this.root.selectionStart == this._cachedSelectionStart) {
        return this.processedSelectionStart;
      } else {
        this._cachedSelectionStart = this.root.selectionStart; // KMW-1
        this.processedSelectionStart = this.root.value._kmwCodeUnitToCodePoint(this.root.selectionStart); // I3319
        this.processedSelectionEnd = this.root.value._kmwCodeUnitToCodePoint(this.root.selectionEnd);     // I3319

        return this.processedSelectionStart;
      }
    }

    getDeadkeyCaret(): number {
      return this.getCaret();
    }

    setCaret(caret: number) {
      let domCaret = this.root.value._kmwCodePointToCodeUnit(caret);
      this.root.setSelectionRange(domCaret, domCaret);
      this.processedSelectionEnd = caret;
    }

    getTextBeforeCaret(): string {
      return this.getText()._kmwSubstring(0, this.getCaret());
    }

    setTextBeforeCaret(text: string) {
      this.getCaret();
      let newCaret = text._kmwLength();
      this.root.value = text + this.getText()._kmwSubstring(this.processedSelectionStart);

      this.setCaret(newCaret);
    }

    getTextAfterCaret(): string {
      this.getCaret();
      return this.getText()._kmwSubstring(this.processedSelectionEnd);
    }

    getText(): string {
      return this.root.value;
    }

    /**
     * Facilitates temporary caching of the TextArea's scroll position.
     */
    saveScroll() {
      this.scrollLeft = this.root.scrollLeft;
      this.scrollTop = this.root.scrollTop;
    }

    /**
     * Restores a previously-saved scroll position for the TextArea.
     */
    restoreScroll() {
      if(this.scrollLeft !== undefined) {
        this.root.scrollLeft = this.scrollLeft;
        this.root.scrollTop = this.scrollTop;

        delete this.scrollLeft;
        delete this.scrollTop;
      }
    }

    deleteCharsBeforeCaret(dn: number) {
      if(dn > 0) {
        let curText = this.getTextBeforeCaret();
        let caret = this.getCaret();

        this.setTextBeforeCaret(curText.kmwSubstring(0, this.getCaret() - dn));
        this.setCaret(caret - dn);
      }
    }

    insertTextBeforeCaret(s: string) {
      if(!s) {
        return;
      }

      let caret = this.getCaret();
      let front = this.getTextBeforeCaret();
      let back = this.getText()._kmwSubstring(this.processedSelectionStart);

      this.root.value = front + s + back;
      this.setCaret(caret + s._kmwLength());
    }
  }
}