import {Plugin} from '@ckeditor/ckeditor5-core';
import {toWidget, toWidgetEditable} from '@ckeditor/ckeditor5-widget';
import RubyTextCommand from "./rubyTextCommand";
import {RubyTextUI} from "./rubyTextUI";

export class RubyTextPlugin extends Plugin {
    static get requires() {
        return [RubyTextUI];
    }

    static get pluginName() {
        return 'RubyTextPlugin';
    }

    init() {
        //Schema.
        this._defineSchema();

        //Converters.
        this._defineConverters();

        //Commands.
        this.editor.commands.add(
            'addRubyText', new RubyTextCommand(this.editor)
        );
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register('ruby', {
            inheritAllFrom: '$inlineObject',
            allowChildren: ['rb', 'rt']
        })

        schema.addChildCheck((context, childDefinition) => {
            if ((context.endsWith('rb') || context.endsWith('rt')) && childDefinition.name == 'ruby') {
                return false;
            }
        });

        schema.register('rb', {
            allowIn: 'ruby',
            allowChildren: '$text',
            isLimit: true
        });

        schema.register('rt', {
            allowIn: 'ruby',
            allowChildren: '$text',
            isLimit: true
        });
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        conversion.for('editingDowncast').elementToElement({
            model: 'ruby',
            view: (_, {writer: viewWriter}) => {
                const section = viewWriter.createContainerElement('ruby', {});

                return toWidget(section, viewWriter, {label: 'Ruby'});
            }
        })

        conversion.for('dataDowncast').elementToElement({
            model: 'ruby',
            view: 'ruby'
        })

        conversion.for('upcast').elementToElement({
            model: 'ruby',
            view: 'ruby'
        });

        //RB.
        conversion.for('editingDowncast').elementToElement({
            model: 'rb',
            view: (_, {writer: viewWriter}) => {
                const section = viewWriter.createEditableElement('span', {
                    class: 'ruby-base'
                });

                return toWidgetEditable(section, viewWriter, {label: 'Ruby base'});
            }
        })
        conversion.for('dataDowncast').elementToElement({
            model: 'rb',
            view: (_, {writer: viewWriter}) => {
                return viewWriter.createContainerElement('span', {
                    class: 'ruby-base'
                });
            }
        });

        conversion.for('upcast').elementToElement({
            model: (_, {writer: modelWriter}) => {
                return modelWriter.createElement('rb');
            },
            view: {
                name: 'span',
                classes: 'ruby-base'
            }
        });

        //RT
        conversion.for('editingDowncast').elementToElement({
            model: 'rt',
            view: (_, {writer: viewWriter}) => {
                const section = viewWriter.createEditableElement('rt');

                return toWidgetEditable(section, viewWriter, {label: 'Ruby text'});
            }
        })

        conversion.for('dataDowncast').elementToElement({
            model: 'rt',
            view: 'rt'
        });

        conversion.for('upcast').elementToElement({
            model: 'rt',
            view: 'rt'
        });
    }
}
