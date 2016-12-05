declare interface IHwStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
}

declare module 'hwStrings' {
  const strings: IHwStrings;
  export = strings;
}
