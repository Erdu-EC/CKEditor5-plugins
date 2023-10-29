import {Plugin} from "@ckeditor/ckeditor5-core";
import {ButtonView, ContextualBalloon, clickOutsideHandler} from "@ckeditor/ckeditor5-ui";
import {RubyTextFormView} from "./rubyTextFormView";
import type RubyTextCommand from "./rubyTextCommand";
import furiganaIcon from "./furigana.svg?raw";

export class RubyTextUI extends Plugin {
    private _formView!: RubyTextFormView;
    private _balloon!: ContextualBalloon;
    private readonly COMMAND_NAME = 'addRubyText';

    init() {
        this._balloon = this.editor.plugins.get(ContextualBalloon);
        this._formView = this._createFormView();

        this.editor.ui.componentFactory.add('ruby-text', () => {
            const button = new ButtonView();

            button.set({
                icon: furiganaIcon,
                label: 'Furigana (Texto ruby)',
                tooltip: true
            });

            const command = this.editor.commands.get(this.COMMAND_NAME) as RubyTextCommand;
            button.bind('isEnabled').to(command, 'isEnabled');

            // Show the UI on button click.
            this.listenTo(button, 'execute', () => {
                this._showUI();
            });

            return button;
        });
    }

    _showUI() {
        this._balloon.add({
            view: this._formView,
            position: this._getBalloonPositionData()
        });

        this._formView.focus();
    }

    _hideUI() {
        // Clear the input field values and reset the form.
        this._formView.input.fieldView.value = '';
        (this._formView.element as HTMLFormElement).reset();

        this._balloon.remove(this._formView);

        // Focus the editing view after inserting the abbreviation so the user can start typing the content
        // right away and keep the editor focused.
        this.editor.editing.view.focus();
    }

    _createFormView() {
        const editor = this.editor;
        const formView = new RubyTextFormView(this.editor.locale);

        // Execute the command after clicking the "Save" button.
        this.listenTo(formView, 'submit', () => {
            // Grab values from the abbreviation and title input fields.
            const rtText = formView.input.fieldView.element?.value;

            editor.model.change(_ => {
                editor.execute('addRubyText', rtText);
            });

            // Hide the form view after submit.
            this._hideUI();
        });

        // Hide the form view after clicking the "Cancel" button.
        this.listenTo(formView, 'cancel', () => {
            this._hideUI();
        });

        // Hide the form view when clicking outside the balloon.
        clickOutsideHandler({
            emitter: formView,
            activator: () => this._balloon.visibleView === formView,
            contextElements: [this._balloon.view.element!],
            callback: () => this._hideUI()
        });

        // Close the panel on esc key press when the form has focus.
        formView.keystrokes.set('Esc', (_, cancel) => {
            this._hideUI();
            cancel();
        });

        return formView;
    }

    _getBalloonPositionData() {
        const view = this.editor.editing.view;
        const viewDocument = view.document;

        // Set a target position by converting view selection range to DOM.
        const target = () => view.domConverter.viewRangeToDom(
            viewDocument.selection.getFirstRange()!
        );

        return {
            target
        };
    }
}