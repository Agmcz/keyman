// Defines the text processing KMW core.
///<reference path="../processor.ts" />
// Defines the LMLayer's outer shell
///<reference path="../../includes/lmlayer.ts" />
// Defines the KeyboardManager and its related types.
///<reference path="../../kmwkeyboards.ts" />

namespace com.keyman.text.prediction {
  export interface ModelSpec {
    /**
     * The model's unique identifier.
     */
    id: string;

    /**
     * The list of supported BCP-47 language codes.  Only one language should be supported,
     * although multiple variants based on region code (at min) may be specified.
     */
    languages: string[];

    /**
     * The path/URL to the file that defines the model.
     */
    path: string;
  }

  export class ModelManager {
    private lmEngine: LMLayer;
    private currentModel: ModelSpec;

    // Tracks registered models by ID.
    private registeredModels: {[id: string]: ModelSpec} = {};

    // Allows for easy model lookup by language code; useful when switching keyboards.
    private languageModelMap: {[language:string]: ModelSpec} = {};

    init() {
      let keyman = com.keyman.singleton;
      this.lmEngine = new LMLayer();
      
      // Registers this module for keyboard (and thus, language) change events.
      keyman['addEventListener']('keyboardchange', this.onKeyboardChange.bind(this));
    }

    private deactivateModel() {
      // TODO:  Call a LMLayer method for model deactivation.
      this.currentModel = null;
    }

    private activateModel(model: ModelSpec) {
      if(!model) {
        throw new Error("Null reference not allowed.");
      }

      // TODO:  Activate this model within the LMLayer!
      let file = model.path;

      //this.lmEngine.initialize(file)  // Currently unsupported.
      console.log("Model detected!");

      this.currentModel = model;
    }

    onKeyboardChange(kbdInfo: KeyboardChangeData) {
      let lgCode = kbdInfo['languageCode'];

      let model = this.languageModelMap[lgCode];

      if(this.currentModel !== model) {
        this.deactivateModel();

        if(model) {
          this.activateModel(model);
        }
      }
    }

    // Accessible publicly as keyman.modelManager.register(model: ModelSpec)
    register(model: ModelSpec): void {
      let keyman = com.keyman.singleton;
      let activeLanguage = keyman.keyboardManager.getActiveLanguage();

      this.registeredModels[model.id] = model;

      // Register the model for each targeted language code variant.
      let mm = this;
      model.languages.forEach(function(code: string) {
        mm.languageModelMap[code] = model;

        // The model's for our active language!  Activate it!
        if(code == activeLanguage) {
          // Manually trigger our model-update event function.
          mm.onKeyboardChange({
            ['internalName']: keyman.keyboardManager.getActiveKeyboardName(),
            ['languageCode']: code,
            ['indirect']: true
          });
        }
      });
    }

    isRegistered(model: ModelSpec): boolean {
      return !! this.registeredModels[model.id];
    }
  }
}