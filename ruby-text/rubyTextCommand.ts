import {Command} from '@ckeditor/ckeditor5-core';
import type {Element} from '@ckeditor/ckeditor5-engine';


export default class RubyTextCommand extends Command {

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        //If the selection is the ruby element, disable the button.
        if (selection.getSelectedElement()?.is('element', 'ruby')) {
            this.isEnabled = false;
            return;
        }
        
        const firstRange = selection.getFirstRange();
        const rbOrRt = firstRange?.getCommonAncestor();

        //If the selection is in the rb or rt element.
        if (rbOrRt && (rbOrRt.is('element', 'rb') || rbOrRt.is('element', 'rt'))) {
            const rubyElement = rbOrRt.parent as Element;
            const IsFullEmpty = rbOrRt.isEmpty || Array.from(rbOrRt.getChildren())
                .every((child) =>
                    (child.is('$text') || child.is('$textProxy')) && child.data.trim() === '')

            if (rbOrRt.is('element', 'rb') && IsFullEmpty) {
                model.change(writer => {
                    writer.remove(rubyElement);
                });
            } else if (rbOrRt.is('element', 'rt') && IsFullEmpty) {
                const rb = rubyElement.getChild(0) as Element;

                model.change(writer => {
                    writer.remove(rbOrRt);
                    writer.unwrap(rb);
                    writer.unwrap(rubyElement);
                });
            }

            //If the selection is in the ruby element, disable the button.
            if (rubyElement.is('element', 'ruby')) {
                this.isEnabled = false;
                return;
            }
        }

        //If the selection is collapsed, disable the button.
        if (firstRange?.isCollapsed) {
            this.isEnabled = false;
            return;
        }

        //If the selection is not collapsed and not in the ruby element, enable the button.
        this.isEnabled = true;
    }

    execute(rtText: string) {
        const selection = this.editor.model.document.selection;

        this.editor.model.change(writer => {
            const ruby = writer.createElement('ruby');
            const rb = writer.createElement('rb');

            const ranges = Array.from(selection.getRanges());
            ranges.forEach((range) => {
                const rangeItems = Array.from(range.getItems());

                rangeItems.forEach((rangeItem) => {
                    if (rangeItem.is('$text') || rangeItem.is('$textProxy')) {
                        const text = rangeItem.data;
                        const textAttributes = Array.from(rangeItem.getAttributes())
                            .filter(([key]) => key !== 'rt')

                        const textNode = writer.createText(text, textAttributes);
                        writer.append(textNode, rb);
                    }
                });
            });

            const rtElement = writer.createElement('rt');
            const rtNode = writer.createText(rtText);
            writer.append(rtNode, rtElement);

            writer.append(rb, ruby);
            writer.append(rtElement, ruby);
            this.editor.model.insertObject(ruby, null, null, {setSelection: 'on'});
        });
    }
}