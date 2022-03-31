# Updating Telegraf Plugins

Telegraf plugins are found at the Sources page, by navigating Load Data > Sources.  

Each plugin has a logo, a markdown file that acts as a README, and a configuration (.conf) file. The markdown and .conf files come directly from the [Telegraf repository](https://github.com/influxdata/telegraf), which is the source of truth for all Telegraf plugins.  

As new plugins are added and existing plugins are updated, these changes should also be reflected at the Sources page. To make this possible with minimal effort, a script was created to handle the tedium of repeatedly copy-pasting files. But a little bit of manual work is still required, namely:  

# Steps

1. Run the script.  
  At the root of the repository, run `yarn telegraf-plugins:update`  
  This will update all Telegraf plugins according to the latest release of Telegraf  
  Optionally, you may add a version number: `yarn telegraf-plugins:update <version number>`  
  For example: `yarn telegraf-plugins:update v1.22.0` will update according to version 1.22.0 

1. Accept the changes to existing files in a new branch in preparation for a pull request.  
1. Accept the new files generated. New files, if any, should be only .conf files the first time you run this script during an update cycle.  
1. For every new .conf file, add the id of the new plugin into the `inputPluginsList` array found in `src/writeData/utils/updateTelegrafPlugins.mjs`  
a. Keep the array alphabetized  
b. The id is the second part after the dot of the string between the set of `[[ ]]` found in a .conf file.  
For example `[[inputs.activemq]]` has id of `activemq`  
1. Repeat the above steps from step 1. Accept the new .md files generated. The reason we need to repeat is because markdown files are generally found by using a file path that includes their id, with each plugin having a different path. There is no other list (except in the steps outlined here) of all plugins.  
1. For any id that fails to find an .md file, the correct markdown file path has a slightly different name than its id in the [Telegraf repository](https://github.com/influxdata/telegraf). You may need to look for the correct markdown file path with your own eyes and manually update it. These exceptions should be limited to only a handful of files.
1. Add or change logos by adding or editing the svg files at `src/writeData/graphics`  
1. Add new plugins to the  `WRITE_DATA_TELEGRAF_PLUGINS` array found in `src/writeData/constants/contentTelegrafPlugins.ts`. Be sure that `markdown` and `image` have an imported file. This step allows the plugins to appear at the Sources page.  
1. _**Optional**_: add a style property for any plugin in the above step to adjust the logo image.  
1. Commit and submit a pull request with all of the changes.  



