const path = require("path");
const fs = require("fs");

const Eleventy = require("./Eleventy");
const TemplatePath = require("./TemplatePath");
const UrlPattern = require("url-pattern");
const deleteRequireCache = require("./Util/DeleteRequireCache");
const debug = require("debug")("Eleventy:Serverless");

class Serverless {
  constructor(name, path, options = {}) {
    this.name = name;

    // second argument is path
    if (typeof path === "string") {
      this.path = path;
    } else {
      // options is the second argument and path is inside options
      options = path;
      this.path = options.path;
    }

    if (!this.path) {
      throw new Error(
        "`path` must exist in the options argument in Eleventy Serverless."
      );
    }

    // ServerlessBundlerPlugin hard-codes to this (even if you used a different file name)
    this.configFilename = "eleventy.config.js";

    // Maps input files to eligible serverless URLs
    this.mapFilename = "eleventy-serverless-map.json";

    this.options = Object.assign(
      {
        inputDir: ".",
        functionsDir: "functions/",
        matchUrlToPattern(path, urlToCompare) {
          let pattern = new UrlPattern(urlToCompare);
          return pattern.match(path);
        },
        // Query String Parameters
        query: {},
        // Inject shared collections
        precompiledCollections: {},
      },
      options
    );

    this.dir = this.getProjectDir();
  }

  getProjectDir() {
    // TODO? improve with process.env.LAMBDA_TASK_ROOT—was `/var/task/` on lambda (not local)
    let dir = path.join(this.options.functionsDir, this.name);
    let paths = [
      path.join(TemplatePath.getWorkingDir(), dir), // netlify dev
      path.join("/var/task/src/", dir), // AWS Lambda absolute path
      path.join(TemplatePath.getWorkingDir()), // after the chdir below
    ];

    for (let path of paths) {
      if (fs.existsSync(path)) {
        return path;
      }
    }

    throw new Error(
      `Couldn’t find the "${dir}" directory. Looked in: ${paths}`
    );
  }

  getContentMap() {
    let fullPath = TemplatePath.absolutePath(this.dir, this.mapFilename);
    debug(
      `Including content map (maps output URLs to input files) from ${fullPath}`
    );
    deleteRequireCache(fullPath);

    let mapContent = require(fullPath);
    return mapContent;
  }

  isServerlessUrl(urlPath) {
    let contentMap = this.getContentMap();

    for (let url in contentMap) {
      if (this.options.matchUrlToPattern(urlPath, url)) {
        return true;
      }
    }
    return false;
  }

  matchUrlPattern(urlPath) {
    let contentMap = this.getContentMap();
    let matches = [];

    for (let url in contentMap) {
      let result = this.options.matchUrlToPattern(urlPath, url);
      if (result) {
        matches.push({
          compareTo: url,
          pathParams: result,
          inputPath: contentMap[url],
        });
      }
    }

    if (matches.length) {
      if (matches.length > 1) {
        console.log(
          `Eleventy Serverless conflict: there are multiple serverless paths that match the current URL (${urlPath}): ${JSON.stringify(
            matches,
            null,
            2
          )}`
        );
      }
      return matches[0];
    }

    return {};
  }

  async render() {
    if (this.dir.startsWith("/var/task/")) {
      process.chdir(this.dir);
    }

    let inputDir = this.options.input || this.options.inputDir;
    let configPath = path.join(this.dir, this.configFilename);
    let { pathParams, inputPath } = this.matchUrlPattern(this.path);

    if (!pathParams || !inputPath) {
      let err = new Error(
        `No matching URL found for ${this.path} in ${JSON.stringify(
          this.getContentMap()
        )}`
      );
      err.httpStatusCode = 404;
      throw err;
    }

    debug(`Current dir: ${process.cwd()}`);
    debug(`Project dir: ${this.dir}`);
    debug(`Config path:  ${configPath}`);

    debug(`Input dir: ${inputDir}`);
    debug(`Requested URL:  ${this.path}`);
    debug("Path params: %o", pathParams);
    debug(`Input path:  ${inputPath}`);

    let elev = new Eleventy(this.options.input || inputPath, null, {
      configPath,
      inputDir,
      config: (eleventyConfig) => {
        if (Object.keys(this.options.precompiledCollections).length > 0) {
          eleventyConfig.setPrecompiledCollections(
            this.options.precompiledCollections
          );
        }

        // Add the params to Global Data
        let globalData = {
          query: this.options.query,
          path: pathParams,
        };

        eleventyConfig.addGlobalData("eleventy.serverless", globalData);
      },
    });

    await elev.init();

    let json = await elev.toJSON();
    if (!json.length) {
      let err = new Error(
        `Couldn’t find any generated output from Eleventy (URL path parameters: ${JSON.stringify(
          pathParams
        )}).`
      );
      err.httpStatusCode = 404;
      throw err;
    }

    for (let entry of json) {
      if (entry.inputPath === inputPath) {
        return entry.content;
      }
    }

    // Log to Serverless Function output
    console.log(json);
    throw new Error(
      `Couldn’t find any matching output from Eleventy for ${inputPath} (${json.length} pages rendered).`
    );
  }
}

module.exports = Serverless;
