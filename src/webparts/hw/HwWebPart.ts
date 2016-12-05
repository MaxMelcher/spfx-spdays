import {
  BaseClientSideWebPart,
  IPropertyPaneSettings,
  IWebPartContext,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import styles from './Hw.module.scss';
import * as strings from 'hwStrings';
import { IHwWebPartProps } from './IHwWebPartProps';

import * as myjQuery from "jquery";
require('jqueryui');

import * as s from "./models/ISearchResults";
import {ICells, ISearchResults, ICellValue} from "./models/ISearchResults";

require('handlebars');

export default class HwWebPart extends BaseClientSideWebPart<IHwWebPartProps> {

  public constructor(context: IWebPartContext) {
    super(context);

    this.weburl = this.context.pageContext.web.absoluteUrl + "/_api/search/query?queryText=";
  }

  public items: any;

  public weburl: string;

  public render(): void {

    var query = this.properties.description;

    var settings: JQueryAjaxSettings = {
      method: "GET",
      headers: {
        'Accept': 'application/json;odata=verbose'
      },

      url: this.weburl + "'" + query + "'"
    }

    this.domElement.innerHTML = "<h2>Hello<h2><hr><h3>Results: <div>Count: <span id='count'></span><div><div id='hits'></div>";

    var self = this;
    myjQuery.ajax(settings).done((data) => {
        self.items = self.GetSearchResults(data);
        myjQuery('#count').text(self.items.length);        
        var hits = myjQuery('#hits');
        
        hits.empty();

        for (var i = 0; i < self.items.length; i++)
        {
            var element = self.items[i];
            hits.append("<div><i class='ms-Icon ms-Icon--Search' aria-hidden='true'></i>  "+ i+1 +". <a href='"+ element.Path +"'>"+ element.Title +"</a></div>");
        }

    }).fail((error) => {
      console.error(error);
    });
  }

  public GetSearchResults(data: any): any[] {
    
    var searchResults = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;

    if (searchResults.length > 0) {
      const temp: any[] = [];
      searchResults.forEach((result: ICells) => {
        var val: Object = {};

        result.Cells.results.forEach((cell: ICellValue) => {
          if (cell.Key == 'HitHighlightedSummary') {
            //need to replace <ddd> markup
            val[cell.Key] = cell.Value.replace(/ <ddd\/>/g, '.');
          }
          else if (cell.Key == 'PublishingImage' && cell.Value !== null) {
            //need to pull image url out of PublishingImage field
            let div = document.createElement('div');
            div.innerHTML = cell.Value;
            let img = div.getElementsByTagName('img')[0];
            val[cell.Key] = img.src;
          }
          else {
            val[cell.Key] = cell.Value;
          }
        });

        temp.push(val);
      });
      return temp;
    }
    else {
      return [];
    }
  }



  protected get propertyPaneSettings(): IPropertyPaneSettings {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }

  protected get disableReactivePropertyChanges(): boolean {
    return false;
  }
}
