/*
 * Copyright (c) 2018 National Research Council Canada (author: Eddie A. Santos)
 * Copyright (c) 2018 SIL International
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/// <reference path="./index.ts" />

/**
 * @file wordlist-model.ts
 * 
 * Defines a simple word list (unigram) model.
 */

 namespace models {
  /**
   * @class WordListModel
   *
   * Defines the word list model, or the unigram model.
   * Unigram models throw away all preceding words, and search
   * for the next word exclusively. As such, they can perform simple
   * prefix searches within words, however they are not very good
   * at predicting the next word.
   */
  LMLayerWorker.models.WordListModel = (function () {
    /** Upper bound on the amount of suggestions to generate. */
    const MAX_SUGGESTIONS = 3;

    return class WordListModel implements WorkerInternalModel {
      private _wordlist: string[];

      constructor(_capabilities: Capabilities, wordlist: string[]) {
        this._wordlist = wordlist;
      }

      predict(transform: Transform, context: Context): Suggestion[] {
        // EVERYTHING to the left of the cursor: 
        let fullLeftContext = context.left || '';
        // Stuff to the left of the cursor in the current word.
        let leftContext = fullLeftContext.split(/\s+/).pop() || '';
        // All text to the left of the cursor INCLUDING anything that has
        // just been typed.
        let prefix = leftContext + (transform.insert || '');
        let suggestions: Suggestion[] = [];

        // Special-case the empty buffer/transform: return the top suggestions.
        if (!transform.insert && context.startOfBuffer && context.endOfBuffer) {
          return this._wordlist.slice(0, MAX_SUGGESTIONS).map(word => ({
            transform: {
              insert: word + ' ',
              deleteLeft: 0
            },
            displayAs: word
          }));
        }

        // Naïve O(n) exhaustive search through the entire word
        // list, up to the suggestion limit.
        for (let word of this._wordlist) {
          let suggestionPrefix = word.substr(0, prefix.length);
          if (prefix !== suggestionPrefix) {
            continue;
          }

          suggestions.push({
            transform: {
              // The left part of the word has already been entered.
              insert: word.substr(leftContext.length) + ' ',
              deleteLeft: 0,
            },
            displayAs: word,
          });

          // Do not exceed the limit on suggestions.
          if (suggestions.length >= MAX_SUGGESTIONS) {
            break;
          }
        }

        return suggestions;
      }
    };
  }());
}