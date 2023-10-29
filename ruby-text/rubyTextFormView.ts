import {
    ButtonView,
    createLabeledInputText,
    LabeledFieldView,
    View,
    ViewCollection,
    submitHandler,
    InputTextView,
    FocusCycler
} from '@ckeditor/ckeditor5-ui';
import {Locale, FocusTracker, KeystrokeHandler} from '@ckeditor/ckeditor5-utils';
import {icons} from '@ckeditor/ckeditor5-core';

export class RubyTextFormView extends View {
    input: LabeledFieldView<InputTextView>;
    private readonly _children: ViewCollection<View>
    private readonly _focusTracker: FocusTracker;
    readonly keystrokes: KeystrokeHandler;

    constructor(locale: Locale) {
        super(locale);

        this._focusTracker = new FocusTracker();
        this.keystrokes = new KeystrokeHandler();

        const children = this._childViews();
        this._children = this.createCollection(Object.values(children));
        this.input = children.labeledInput;

        this.setTemplate({
            tag: 'form',
            attributes: {
                class: ['ck', 'ck-ruby-form'],
                tabindex: '-1'
            },
            children: this._children
        });

        //Focus tracker.
        new FocusCycler({
            focusables: this._children,
            focusTracker: this._focusTracker,
            keystrokeHandler: this.keystrokes,
            actions: {
                focusPrevious: 'shift + tab',
                focusNext: 'tab'
            }
        });
    }

    render() {
        super.render();

        submitHandler({
            view: this
        });

        Array.from(this._children).forEach(view => {
            // Register the view in the focus tracker.
            this._focusTracker.add(view.element!);
        });

        // Start listening for the keystrokes coming from #element.
        this.keystrokes.listenTo(this.element!);
    }

    focus() {
        this.input.focus();
    }

    destroy() {
        super.destroy();

        this._focusTracker.destroy();
        this.keystrokes.destroy();
    }

    _childViews() {
        //Input.
        const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
        labeledInput.label = 'Texto superior:';

        //Button.
        const saveButton = this._createButton(
            'Insertar', icons.check, 'ck-button-save', 'submit'
        );
        const cancelButton = this._createButton(
            'Cancel', icons.cancel, 'ck-button-cancel'
        );
        cancelButton.delegate('execute').to(this, 'cancel');

        return {
            labeledInput,
            saveButton,
            cancelButton
        }
    }

    _createButton(label: string, icon: string, className: string, type?: "button" | "submit" | "reset" | "menu") {
        const button = new ButtonView();

        button.set({
            label,
            icon,
            tooltip: true,
            class: className
        });
        if (type)
            button.type = type;

        return button;
    }
}