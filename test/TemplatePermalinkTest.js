const test = require("ava");
const TemplatePermalink = require("../src/TemplatePermalink");
const { generate } = TemplatePermalink;

test("Simple straight permalink", (t) => {
  t.is(
    new TemplatePermalink("permalinksubfolder/test.html").toOutputPath(),
    "permalinksubfolder/test.html"
  );
  t.is(
    new TemplatePermalink("./permalinksubfolder/test.html").toOutputPath(),
    "permalinksubfolder/test.html"
  );

  t.is(
    new TemplatePermalink("permalinksubfolder/test.html").toHref(),
    "/permalinksubfolder/test.html"
  );
  t.is(
    new TemplatePermalink("./permalinksubfolder/test.html").toHref(),
    "/permalinksubfolder/test.html"
  );
  t.is(new TemplatePermalink("./testindex.html").toHref(), "/testindex.html");
  t.is(
    new TemplatePermalink("./permalinksubfolder/testindex.html").toHref(),
    "/permalinksubfolder/testindex.html"
  );
});

test("Permalink without filename", (t) => {
  t.is(
    new TemplatePermalink("permalinksubfolder/").toOutputPath(),
    "permalinksubfolder/index.html"
  );
  t.is(
    new TemplatePermalink("./permalinksubfolder/").toOutputPath(),
    "permalinksubfolder/index.html"
  );
  t.is(
    new TemplatePermalink("/permalinksubfolder/").toOutputPath(),
    "/permalinksubfolder/index.html"
  );

  t.is(
    new TemplatePermalink("permalinksubfolder/").toHref(),
    "/permalinksubfolder/"
  );
  t.is(
    new TemplatePermalink("./permalinksubfolder/").toHref(),
    "/permalinksubfolder/"
  );
  t.is(
    new TemplatePermalink("/permalinksubfolder/").toHref(),
    "/permalinksubfolder/"
  );
});

test("Permalink with pagination subdir", (t) => {
  t.is(
    new TemplatePermalink("permalinksubfolder/test.html", "0/").toOutputPath(),
    "permalinksubfolder/0/test.html"
  );
  t.is(
    new TemplatePermalink("permalinksubfolder/test.html", "1/").toOutputPath(),
    "permalinksubfolder/1/test.html"
  );

  t.is(
    new TemplatePermalink("permalinksubfolder/test.html", "0/").toHref(),
    "/permalinksubfolder/0/test.html"
  );
  t.is(
    new TemplatePermalink("permalinksubfolder/test.html", "1/").toHref(),
    "/permalinksubfolder/1/test.html"
  );
});

test("Permalink generate", (t) => {
  t.is(generate("./", "index").toOutputPath(), "index.html");
  t.is(generate("./", "index").toHref(), "/");
  t.is(generate(".", "index").toOutputPath(), "index.html");
  t.is(generate(".", "index").toHref(), "/");
  t.is(generate(".", "test").toOutputPath(), "test/index.html");
  t.is(generate(".", "test").toHref(), "/test/");
  t.is(generate(".", "test", "0/").toOutputPath(), "test/0/index.html");
  t.is(generate(".", "test", "0/").toHref(), "/test/0/");
  t.is(generate(".", "test", "1/").toOutputPath(), "test/1/index.html");
  t.is(generate(".", "test", "1/").toHref(), "/test/1/");
});

test("Permalink generate with suffix", (t) => {
  t.is(generate(".", "test", null, "-o").toOutputPath(), "test/index-o.html");
  t.is(generate(".", "test", null, "-o").toHref(), "/test/index-o.html");
  t.is(generate(".", "test", "1/", "-o").toOutputPath(), "test/1/index-o.html");
  t.is(generate(".", "test", "1/", "-o").toHref(), "/test/1/index-o.html");
});

test("Permalink generate with new extension", (t) => {
  t.is(generate(".", "test", null, null, "css").toOutputPath(), "test.css");
  t.is(generate(".", "test", null, null, "css").toHref(), "/test.css");
  t.is(generate(".", "test", "1/", null, "css").toOutputPath(), "1/test.css");
  t.is(generate(".", "test", "1/", null, "css").toHref(), "/1/test.css");
});

test("Permalink generate with subfolders", (t) => {
  t.is(
    generate("permalinksubfolder/", "index").toOutputPath(),
    "permalinksubfolder/index.html"
  );
  t.is(
    generate("permalinksubfolder/", "test").toOutputPath(),
    "permalinksubfolder/test/index.html"
  );
  t.is(
    generate("permalinksubfolder/", "test", "1/", "-o").toOutputPath(),
    "permalinksubfolder/test/1/index-o.html"
  );

  t.is(
    generate("permalinksubfolder/", "index").toHref(),
    "/permalinksubfolder/"
  );
  t.is(
    generate("permalinksubfolder/", "test").toHref(),
    "/permalinksubfolder/test/"
  );
  t.is(
    generate("permalinksubfolder/", "test", "1/", "-o").toHref(),
    "/permalinksubfolder/test/1/index-o.html"
  );
});

test("Permalink matching folder and filename", (t) => {
  let hasDupe = TemplatePermalink._hasDuplicateFolder;
  t.is(hasDupe("subfolder", "component"), false);
  t.is(hasDupe("subfolder/", "component"), false);
  t.is(hasDupe(".", "component"), false);

  t.is(hasDupe("component", "component"), true);
  t.is(hasDupe("component/", "component"), true);

  t.is(
    generate("component/", "component").toOutputPath(),
    "component/index.html"
  );
  t.is(generate("component/", "component").toHref(), "/component/");
});

test("Permalink Object, just build", (t) => {
  t.is(
    new TemplatePermalink({
      build: "permalinksubfolder/test.html",
    }).toOutputPath(),
    "permalinksubfolder/test.html"
  );

  t.is(
    new TemplatePermalink({
      build: false,
    }).toOutputPath(),
    false
  );

  t.throws(() => {
    new TemplatePermalink({
      build: true,
    }).toOutputPath();
  });
});

test("Permalink Object, serverless URLs", (t) => {
  // serverless
  t.is(
    new TemplatePermalink({
      serverless: "permalinksubfolder/test.html",
    }).toOutputPath(),
    false
  );

  t.is(
    new TemplatePermalink({
      serverless: "permalinksubfolder/test.html",
    }).toHref(),
    "permalinksubfolder/test.html"
  );

  // request
  t.is(
    new TemplatePermalink({
      request: "/url/",
    }).toOutputPath(),
    false
  );

  t.is(
    new TemplatePermalink({
      request: "/url/",
    }).toHref(),
    "/url/"
  );

  // rando
  t.is(
    new TemplatePermalink({
      rando: "/url/",
    }).toOutputPath(),
    false
  );

  t.is(
    new TemplatePermalink({
      rando: "/url/",
    }).toHref(),
    "/url/"
  );
});

test("Permalink Object, combo build and serverless URLs", (t) => {
  t.is(
    new TemplatePermalink({
      build: "/url/",
      serverless: "/serverless/",
    }).toOutputPath(),
    "/url/index.html"
  );

  t.is(
    new TemplatePermalink({
      build: "/url/",
      serverless: "/serverless/",
    }).toHref(),
    "/url/"
  );

  // reordered, serverless is primary
  t.is(
    new TemplatePermalink({
      serverless: "/serverless/",
      build: "/url/",
    }).toOutputPath(),
    "/url/index.html"
  );

  t.is(
    new TemplatePermalink({
      serverless: "/serverless/",
      build: "/url/",
    }).toHref(),
    "/serverless/"
  );
});

test("Permalink Object, empty object", (t) => {
  t.is(new TemplatePermalink({}).toOutputPath(), false);

  t.is(new TemplatePermalink({}).toHref(), false);
});

test("Permalink Object, serverless with path params", (t) => {
  let perm = new TemplatePermalink({
    serverless: "/serverless/:test/",
  });
  perm.setServerlessPathData({
    test: "yeearg",
  });
  t.is(perm.toHref(), "/serverless/yeearg/");
});

test("Permalink generate apache content negotiation #761", (t) => {
  let tp = new TemplatePermalink("index.es.html");
  tp.setUrlTransforms([
    function ({ outputPath }) {
      return "/";
    },
  ]);

  t.is(tp.toHref(), "/");
  t.is(tp.toOutputPath(), "index.es.html");

  // Note that generate does some preprocessing to the raw permalink value (compared to `new TemplatePermalink`)
  let tp1 = TemplatePermalink.generate("", "index.es");
  tp1.setUrlTransforms([
    function ({ outputPath }) {
      return "/";
    },
  ]);
  t.is(tp1.toHref(), "/");
  // best paired with https://www.11ty.dev/docs/data-eleventy-supplied/#filepathstem for index.es.html
  t.is(tp1.toOutputPath(), "index.es/index.html");
});

test("Permalink generate apache content negotiation with subdirectory #761", (t) => {
  let tp = new TemplatePermalink("test/index.es.html");
  tp.setUrlTransforms([
    function ({ outputPath }) {
      return "/test/";
    },
  ]);

  t.is(tp.toHref(), "/test/");
  t.is(tp.toOutputPath(), "test/index.es.html");

  // Note that generate does some preprocessing to the raw permalink value (compared to `new TemplatePermalink`)
  let tp1 = TemplatePermalink.generate("test", "index.es");
  tp1.setUrlTransforms([
    function ({ outputPath }) {
      return "/test/";
    },
  ]);

  t.is(tp1.toHref(), "/test/");
  // best paired with https://www.11ty.dev/docs/data-eleventy-supplied/#filepathstem for test/index.es.html
  t.is(tp1.toOutputPath(), "test/index.es/index.html");
});

test("Permalink generate apache content negotiation non-index file name #761", (t) => {
  // Note that generate does some preprocessing to the raw permalink value (compared to `new TemplatePermalink`)
  let tp = TemplatePermalink.generate("permalinksubfolder", "about.es");

  t.is(tp.toHref(), "/permalinksubfolder/about.es/");
  t.is(tp.toOutputPath(), "permalinksubfolder/about.es/index.html");
});

test("Permalink generate with urlTransforms #761", (t) => {
  // Note that TemplatePermalink.generate is used by Template and different from new TemplatePermalink
  let tp = TemplatePermalink.generate("permalinksubfolder", "index.es");

  tp.setUrlTransforms([
    function ({ outputPath }) {
      return "/permalinksubfolder/";
    },
  ]);

  t.is(tp.toHref(), "/permalinksubfolder/");
  // best paired with https://www.11ty.dev/docs/data-eleventy-supplied/#filepathstem for permalinksubfolder/index.es.html
  t.is(tp.toOutputPath(), "permalinksubfolder/index.es/index.html");
});

test("Permalink generate with urlTransforms (skip via undefined) #761", (t) => {
  // Note that TemplatePermalink.generate is used by Template and different from new TemplatePermalink
  let tp = TemplatePermalink.generate("permalinksubfolder", "index.es");

  tp.setUrlTransforms([
    function ({ outputPath }) {
      // return nothing
    },
  ]);

  t.is(tp.toHref(), "/permalinksubfolder/index.es/");
  // best paired with https://www.11ty.dev/docs/data-eleventy-supplied/#filepathstem for permalinksubfolder/index.es.html
  t.is(tp.toOutputPath(), "permalinksubfolder/index.es/index.html");
});

test("Permalink generate with 2 urlTransforms #761", (t) => {
  // Note that TemplatePermalink.generate is used by Template and different from new TemplatePermalink
  let tp = TemplatePermalink.generate("permalinksubfolder", "index.es");
  tp.setUrlTransforms([
    function ({ outputPath }) {
      return "/abc/";
    },
    function ({ outputPath }) {
      return "/def/";
    },
  ]);

  t.is(tp.toHref(), "/def/");
  // best paired with https://www.11ty.dev/docs/data-eleventy-supplied/#filepathstem for permalinksubfolder/index.es.html
  t.is(tp.toOutputPath(), "permalinksubfolder/index.es/index.html");
});

test("Permalink generate with urlTransforms returns index.html #761", (t) => {
  // Note that TemplatePermalink.generate is used by Template and different from new TemplatePermalink
  let tp = TemplatePermalink.generate("permalinksubfolder", "index.es");
  tp.setUrlTransforms([
    function ({ outputPath }) {
      return "/abc/index.html";
    },
  ]);

  t.is(tp.toHref(), "/abc/");
  // best paired with https://www.11ty.dev/docs/data-eleventy-supplied/#filepathstem for permalinksubfolder/index.es.html
  t.is(tp.toOutputPath(), "permalinksubfolder/index.es/index.html");
});

test("Permalink generate with urlTransforms code (index file) #761", (t) => {
  let tp1 = new TemplatePermalink("index.es.html");

  tp1.setUrlTransforms([
    function ({ outputPath }) {
      if ((outputPath || "").match(new RegExp(".[a-z]{2}.html$", "i"))) {
        // trailing slash
        return outputPath.slice(0, -1 * ".en.html".length) + "/";
      }
    },
  ]);

  t.is(tp1.toHref(), "/");

  let tp2 = new TemplatePermalink("index.es.html");

  tp2.setUrlTransforms([
    function ({ outputPath }) {
      if ((outputPath || "").match(new RegExp(".[a-z]{2}.html$", "i"))) {
        // no trailing slash
        return outputPath.slice(0, -1 * ".en.html".length);
      }
    },
  ]);

  t.is(tp2.toHref(), "/");
});

test("Permalink generate with urlTransforms code (not index file) #761", (t) => {
  let tp1 = new TemplatePermalink("about.es.html");

  tp1.setUrlTransforms([
    function ({ outputPath }) {
      if ((outputPath || "").match(new RegExp(".[a-z]{2}.html$", "i"))) {
        // trailing slash
        return outputPath.slice(0, -1 * ".en.html".length) + "/";
      }
    },
  ]);

  t.is(tp1.toHref(), "/about/");

  let tp2 = new TemplatePermalink("about.es.html");

  tp2.setUrlTransforms([
    function ({ outputPath }) {
      if ((outputPath || "").match(new RegExp(".[a-z]{2}.html$", "i"))) {
        // no trailing slash
        return outputPath.slice(0, -1 * ".en.html".length);
      }
    },
  ]);

  t.is(tp2.toHref(), "/about");
});

test("Permalink generate with urlTransforms code (index file with subdir) #761", (t) => {
  let tp1 = new TemplatePermalink("subdir/index.es.html");

  tp1.setUrlTransforms([
    function ({ outputPath }) {
      if ((outputPath || "").match(new RegExp(".[a-z]{2}.html$", "i"))) {
        // trailing slash
        return outputPath.slice(0, -1 * ".en.html".length) + "/";
      }
    },
  ]);

  t.is(tp1.toHref(), "/subdir/");

  let tp2 = new TemplatePermalink("subdir/index.es.html");

  tp2.setUrlTransforms([
    function ({ outputPath }) {
      if ((outputPath || "").match(new RegExp(".[a-z]{2}.html$", "i"))) {
        // no trailing slash
        return outputPath.slice(0, -1 * ".en.html".length);
      }
    },
  ]);

  t.is(tp2.toHref(), "/subdir/");
});

test("Permalink generate with urlTransforms code (not-index file with subdir) #761", (t) => {
  let tp1 = new TemplatePermalink("subdir/about.es.html");

  tp1.setUrlTransforms([
    function ({ outputPath }) {
      if ((outputPath || "").match(new RegExp(".[a-z]{2}.html$", "i"))) {
        // trailing slash
        return outputPath.slice(0, -1 * ".en.html".length) + "/";
      }
    },
  ]);

  t.is(tp1.toHref(), "/subdir/about/");

  let tp2 = new TemplatePermalink("subdir/about.es.html");

  tp2.setUrlTransforms([
    function ({ outputPath }) {
      if ((outputPath || "").match(new RegExp(".[a-z]{2}.html$", "i"))) {
        // no trailing slash
        return outputPath.slice(0, -1 * ".en.html".length);
      }
    },
  ]);

  t.is(tp2.toHref(), "/subdir/about");
});
