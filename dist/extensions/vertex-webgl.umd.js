(function(global, factory) {
  typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.HydraVertexExtension = {}));
})(this, (function(exports2) {
  "use strict";
  var astralIdentifierCodes = [509, 0, 227, 0, 150, 4, 294, 9, 1368, 2, 2, 1, 6, 3, 41, 2, 5, 0, 166, 1, 574, 3, 9, 9, 7, 9, 32, 4, 318, 1, 80, 3, 71, 10, 50, 3, 123, 2, 54, 14, 32, 10, 3, 1, 11, 3, 46, 10, 8, 0, 46, 9, 7, 2, 37, 13, 2, 9, 6, 1, 45, 0, 13, 2, 49, 13, 9, 3, 2, 11, 83, 11, 7, 0, 3, 0, 158, 11, 6, 9, 7, 3, 56, 1, 2, 6, 3, 1, 3, 2, 10, 0, 11, 1, 3, 6, 4, 4, 68, 8, 2, 0, 3, 0, 2, 3, 2, 4, 2, 0, 15, 1, 83, 17, 10, 9, 5, 0, 82, 19, 13, 9, 214, 6, 3, 8, 28, 1, 83, 16, 16, 9, 82, 12, 9, 9, 7, 19, 58, 14, 5, 9, 243, 14, 166, 9, 71, 5, 2, 1, 3, 3, 2, 0, 2, 1, 13, 9, 120, 6, 3, 6, 4, 0, 29, 9, 41, 6, 2, 3, 9, 0, 10, 10, 47, 15, 343, 9, 54, 7, 2, 7, 17, 9, 57, 21, 2, 13, 123, 5, 4, 0, 2, 1, 2, 6, 2, 0, 9, 9, 49, 4, 2, 1, 2, 4, 9, 9, 330, 3, 10, 1, 2, 0, 49, 6, 4, 4, 14, 10, 5350, 0, 7, 14, 11465, 27, 2343, 9, 87, 9, 39, 4, 60, 6, 26, 9, 535, 9, 470, 0, 2, 54, 8, 3, 82, 0, 12, 1, 19628, 1, 4178, 9, 519, 45, 3, 22, 543, 4, 4, 5, 9, 7, 3, 6, 31, 3, 149, 2, 1418, 49, 513, 54, 5, 49, 9, 0, 15, 0, 23, 4, 2, 14, 1361, 6, 2, 16, 3, 6, 2, 1, 2, 4, 101, 0, 161, 6, 10, 9, 357, 0, 62, 13, 499, 13, 245, 1, 2, 9, 726, 6, 110, 6, 6, 9, 4759, 9, 787719, 239];
  var astralIdentifierStartCodes = [0, 11, 2, 25, 2, 18, 2, 1, 2, 14, 3, 13, 35, 122, 70, 52, 268, 28, 4, 48, 48, 31, 14, 29, 6, 37, 11, 29, 3, 35, 5, 7, 2, 4, 43, 157, 19, 35, 5, 35, 5, 39, 9, 51, 13, 10, 2, 14, 2, 6, 2, 1, 2, 10, 2, 14, 2, 6, 2, 1, 4, 51, 13, 310, 10, 21, 11, 7, 25, 5, 2, 41, 2, 8, 70, 5, 3, 0, 2, 43, 2, 1, 4, 0, 3, 22, 11, 22, 10, 30, 66, 18, 2, 1, 11, 21, 11, 25, 71, 55, 7, 1, 65, 0, 16, 3, 2, 2, 2, 28, 43, 28, 4, 28, 36, 7, 2, 27, 28, 53, 11, 21, 11, 18, 14, 17, 111, 72, 56, 50, 14, 50, 14, 35, 39, 27, 10, 22, 251, 41, 7, 1, 17, 2, 60, 28, 11, 0, 9, 21, 43, 17, 47, 20, 28, 22, 13, 52, 58, 1, 3, 0, 14, 44, 33, 24, 27, 35, 30, 0, 3, 0, 9, 34, 4, 0, 13, 47, 15, 3, 22, 0, 2, 0, 36, 17, 2, 24, 20, 1, 64, 6, 2, 0, 2, 3, 2, 14, 2, 9, 8, 46, 39, 7, 3, 1, 3, 21, 2, 6, 2, 1, 2, 4, 4, 0, 19, 0, 13, 4, 31, 9, 2, 0, 3, 0, 2, 37, 2, 0, 26, 0, 2, 0, 45, 52, 19, 3, 21, 2, 31, 47, 21, 1, 2, 0, 185, 46, 42, 3, 37, 47, 21, 0, 60, 42, 14, 0, 72, 26, 38, 6, 186, 43, 117, 63, 32, 7, 3, 0, 3, 7, 2, 1, 2, 23, 16, 0, 2, 0, 95, 7, 3, 38, 17, 0, 2, 0, 29, 0, 11, 39, 8, 0, 22, 0, 12, 45, 20, 0, 19, 72, 200, 32, 32, 8, 2, 36, 18, 0, 50, 29, 113, 6, 2, 1, 2, 37, 22, 0, 26, 5, 2, 1, 2, 31, 15, 0, 328, 18, 16, 0, 2, 12, 2, 33, 125, 0, 80, 921, 103, 110, 18, 195, 2637, 96, 16, 1071, 18, 5, 26, 3994, 6, 582, 6842, 29, 1763, 568, 8, 30, 18, 78, 18, 29, 19, 47, 17, 3, 32, 20, 6, 18, 433, 44, 212, 63, 129, 74, 6, 0, 67, 12, 65, 1, 2, 0, 29, 6135, 9, 1237, 42, 9, 8936, 3, 2, 6, 2, 1, 2, 290, 16, 0, 30, 2, 3, 0, 15, 3, 9, 395, 2309, 106, 6, 12, 4, 8, 8, 9, 5991, 84, 2, 70, 2, 1, 3, 0, 3, 1, 3, 3, 2, 11, 2, 0, 2, 6, 2, 64, 2, 3, 3, 7, 2, 6, 2, 27, 2, 3, 2, 4, 2, 0, 4, 6, 2, 339, 3, 24, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 30, 2, 24, 2, 7, 1845, 30, 7, 5, 262, 61, 147, 44, 11, 6, 17, 0, 322, 29, 19, 43, 485, 27, 229, 29, 3, 0, 496, 6, 2, 3, 2, 1, 2, 14, 2, 196, 60, 67, 8, 0, 1205, 3, 2, 26, 2, 1, 2, 0, 3, 0, 2, 9, 2, 3, 2, 0, 2, 0, 7, 0, 5, 0, 2, 0, 2, 0, 2, 2, 2, 1, 2, 0, 3, 0, 2, 0, 2, 0, 2, 0, 2, 0, 2, 1, 2, 0, 3, 3, 2, 6, 2, 3, 2, 3, 2, 0, 2, 9, 2, 16, 6, 2, 2, 4, 2, 16, 4421, 42719, 33, 4153, 7, 221, 3, 5761, 15, 7472, 16, 621, 2467, 541, 1507, 4938, 6, 4191];
  var nonASCIIidentifierChars = "‌‍·̀-ͯ·҃-֑҇-ׇֽֿׁׂׅׄؐ-ًؚ-٩ٰۖ-ۜ۟-۪ۤۧۨ-ۭ۰-۹ܑܰ-݊ަ-ް߀-߉߫-߽߳ࠖ-࠙ࠛ-ࠣࠥ-ࠧࠩ-࡙࠭-࡛ࢗ-࢟࣊-ࣣ࣡-ःऺ-़ा-ॏ॑-ॗॢॣ०-९ঁ-ঃ়া-ৄেৈো-্ৗৢৣ০-৯৾ਁ-ਃ਼ਾ-ੂੇੈੋ-੍ੑ੦-ੱੵઁ-ઃ઼ા-ૅે-ૉો-્ૢૣ૦-૯ૺ-૿ଁ-ଃ଼ା-ୄେୈୋ-୍୕-ୗୢୣ୦-୯ஂா-ூெ-ைொ-்ௗ௦-௯ఀ-ఄ఼ా-ౄె-ైొ-్ౕౖౢౣ౦-౯ಁ-ಃ಼ಾ-ೄೆ-ೈೊ-್ೕೖೢೣ೦-೯ೳഀ-ഃ഻഼ാ-ൄെ-ൈൊ-്ൗൢൣ൦-൯ඁ-ඃ්ා-ුූෘ-ෟ෦-෯ෲෳัิ-ฺ็-๎๐-๙ັິ-ຼ່-໎໐-໙༘༙༠-༩༹༵༷༾༿ཱ-྄྆྇ྍ-ྗྙ-ྼ࿆ါ-ှ၀-၉ၖ-ၙၞ-ၠၢ-ၤၧ-ၭၱ-ၴႂ-ႍႏ-ႝ፝-፟፩-፱ᜒ-᜕ᜲ-᜴ᝒᝓᝲᝳ឴-៓៝០-៩᠋-᠍᠏-᠙ᢩᤠ-ᤫᤰ-᤻᥆-᥏᧐-᧚ᨗ-ᨛᩕ-ᩞ᩠-᩿᩼-᪉᪐-᪙᪰-᪽ᪿ-ᫎᬀ-ᬄ᬴-᭄᭐-᭙᭫-᭳ᮀ-ᮂᮡ-ᮭ᮰-᮹᯦-᯳ᰤ-᰷᱀-᱉᱐-᱙᳐-᳔᳒-᳨᳭᳴᳷-᳹᷀-᷿‌‍‿⁀⁔⃐-⃥⃜⃡-⃰⳯-⵿⳱ⷠ-〪ⷿ-゙゚〯・꘠-꘩꙯ꙴ-꙽ꚞꚟ꛰꛱ꠂ꠆ꠋꠣ-ꠧ꠬ꢀꢁꢴ-ꣅ꣐-꣙꣠-꣱ꣿ-꤉ꤦ-꤭ꥇ-꥓ꦀ-ꦃ꦳-꧀꧐-꧙ꧥ꧰-꧹ꨩ-ꨶꩃꩌꩍ꩐-꩙ꩻ-ꩽꪰꪲ-ꪴꪷꪸꪾ꪿꫁ꫫ-ꫯꫵ꫶ꯣ-ꯪ꯬꯭꯰-꯹ﬞ︀-️︠-︯︳︴﹍-﹏０-９＿･";
  var nonASCIIidentifierStartChars = "ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽͿΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԯԱ-Ֆՙՠ-ֈא-תׯ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࡠ-ࡪࡰ-ࢇࢉ-ࢎࢠ-ࣉऄ-हऽॐक़-ॡॱ-ঀঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱৼਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡૹଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-హఽౘ-ౚౝౠౡಀಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೝೞೠೡೱೲഄ-ഌഎ-ഐഒ-ഺഽൎൔ-ൖൟ-ൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄຆ-ຊຌ-ຣລວ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏽᏸ-ᏽᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛸᜀ-ᜑᜟ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡸᢀ-ᢨᢪᢰ-ᣵᤀ-ᤞᥐ-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭌᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᲀ-ᲊᲐ-ᲺᲽ-Ჿᳩ-ᳬᳮ-ᳳᳵᳶᳺᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕ℘-ℝℤΩℨK-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞ々-〇〡-〩〱-〵〸-〼ぁ-ゖ゛-ゟァ-ヺー-ヿㄅ-ㄯㄱ-ㆎㆠ-ㆿㇰ-ㇿ㐀-䶿一-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚝꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꟍꟐꟑꟓꟕ-Ƛꟲ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꣽꣾꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꧠ-ꧤꧦ-ꧯꧺ-ꧾꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꩾ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꬰ-ꭚꭜ-ꭩꭰ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ";
  var reservedWords = {
    3: "abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile",
    5: "class enum extends super const export import",
    6: "enum",
    strict: "implements interface let package private protected public static yield",
    strictBind: "eval arguments"
  };
  var ecma5AndLessKeywords = "break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this";
  var keywords$1 = {
    5: ecma5AndLessKeywords,
    "5module": ecma5AndLessKeywords + " export import",
    6: ecma5AndLessKeywords + " const class extends export import super"
  };
  var keywordRelationalOperator = /^in(stanceof)?$/;
  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");
  function isInAstralSet(code, set) {
    var pos = 65536;
    for (var i2 = 0; i2 < set.length; i2 += 2) {
      pos += set[i2];
      if (pos > code) {
        return false;
      }
      pos += set[i2 + 1];
      if (pos >= code) {
        return true;
      }
    }
    return false;
  }
  function isIdentifierStart(code, astral) {
    if (code < 65) {
      return code === 36;
    }
    if (code < 91) {
      return true;
    }
    if (code < 97) {
      return code === 95;
    }
    if (code < 123) {
      return true;
    }
    if (code <= 65535) {
      return code >= 170 && nonASCIIidentifierStart.test(String.fromCharCode(code));
    }
    if (astral === false) {
      return false;
    }
    return isInAstralSet(code, astralIdentifierStartCodes);
  }
  function isIdentifierChar(code, astral) {
    if (code < 48) {
      return code === 36;
    }
    if (code < 58) {
      return true;
    }
    if (code < 65) {
      return false;
    }
    if (code < 91) {
      return true;
    }
    if (code < 97) {
      return code === 95;
    }
    if (code < 123) {
      return true;
    }
    if (code <= 65535) {
      return code >= 170 && nonASCIIidentifier.test(String.fromCharCode(code));
    }
    if (astral === false) {
      return false;
    }
    return isInAstralSet(code, astralIdentifierStartCodes) || isInAstralSet(code, astralIdentifierCodes);
  }
  var TokenType = function TokenType2(label, conf) {
    if (conf === void 0) conf = {};
    this.label = label;
    this.keyword = conf.keyword;
    this.beforeExpr = !!conf.beforeExpr;
    this.startsExpr = !!conf.startsExpr;
    this.isLoop = !!conf.isLoop;
    this.isAssign = !!conf.isAssign;
    this.prefix = !!conf.prefix;
    this.postfix = !!conf.postfix;
    this.binop = conf.binop || null;
    this.updateContext = null;
  };
  function binop(name, prec) {
    return new TokenType(name, { beforeExpr: true, binop: prec });
  }
  var beforeExpr = { beforeExpr: true }, startsExpr = { startsExpr: true };
  var keywords = {};
  function kw(name, options) {
    if (options === void 0) options = {};
    options.keyword = name;
    return keywords[name] = new TokenType(name, options);
  }
  var types$1 = {
    num: new TokenType("num", startsExpr),
    regexp: new TokenType("regexp", startsExpr),
    string: new TokenType("string", startsExpr),
    name: new TokenType("name", startsExpr),
    privateId: new TokenType("privateId", startsExpr),
    eof: new TokenType("eof"),
    // Punctuation token types.
    bracketL: new TokenType("[", { beforeExpr: true, startsExpr: true }),
    bracketR: new TokenType("]"),
    braceL: new TokenType("{", { beforeExpr: true, startsExpr: true }),
    braceR: new TokenType("}"),
    parenL: new TokenType("(", { beforeExpr: true, startsExpr: true }),
    parenR: new TokenType(")"),
    comma: new TokenType(",", beforeExpr),
    semi: new TokenType(";", beforeExpr),
    colon: new TokenType(":", beforeExpr),
    dot: new TokenType("."),
    question: new TokenType("?", beforeExpr),
    questionDot: new TokenType("?."),
    arrow: new TokenType("=>", beforeExpr),
    template: new TokenType("template"),
    invalidTemplate: new TokenType("invalidTemplate"),
    ellipsis: new TokenType("...", beforeExpr),
    backQuote: new TokenType("`", startsExpr),
    dollarBraceL: new TokenType("${", { beforeExpr: true, startsExpr: true }),
    // Operators. These carry several kinds of properties to help the
    // parser use them properly (the presence of these properties is
    // what categorizes them as operators).
    //
    // `binop`, when present, specifies that this operator is a binary
    // operator, and will refer to its precedence.
    //
    // `prefix` and `postfix` mark the operator as a prefix or postfix
    // unary operator.
    //
    // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
    // binary operators with a very low precedence, that should result
    // in AssignmentExpression nodes.
    eq: new TokenType("=", { beforeExpr: true, isAssign: true }),
    assign: new TokenType("_=", { beforeExpr: true, isAssign: true }),
    incDec: new TokenType("++/--", { prefix: true, postfix: true, startsExpr: true }),
    prefix: new TokenType("!/~", { beforeExpr: true, prefix: true, startsExpr: true }),
    logicalOR: binop("||", 1),
    logicalAND: binop("&&", 2),
    bitwiseOR: binop("|", 3),
    bitwiseXOR: binop("^", 4),
    bitwiseAND: binop("&", 5),
    equality: binop("==/!=/===/!==", 6),
    relational: binop("</>/<=/>=", 7),
    bitShift: binop("<</>>/>>>", 8),
    plusMin: new TokenType("+/-", { beforeExpr: true, binop: 9, prefix: true, startsExpr: true }),
    modulo: binop("%", 10),
    star: binop("*", 10),
    slash: binop("/", 10),
    starstar: new TokenType("**", { beforeExpr: true }),
    coalesce: binop("??", 1),
    // Keyword token types.
    _break: kw("break"),
    _case: kw("case", beforeExpr),
    _catch: kw("catch"),
    _continue: kw("continue"),
    _debugger: kw("debugger"),
    _default: kw("default", beforeExpr),
    _do: kw("do", { isLoop: true, beforeExpr: true }),
    _else: kw("else", beforeExpr),
    _finally: kw("finally"),
    _for: kw("for", { isLoop: true }),
    _function: kw("function", startsExpr),
    _if: kw("if"),
    _return: kw("return", beforeExpr),
    _switch: kw("switch"),
    _throw: kw("throw", beforeExpr),
    _try: kw("try"),
    _var: kw("var"),
    _const: kw("const"),
    _while: kw("while", { isLoop: true }),
    _with: kw("with"),
    _new: kw("new", { beforeExpr: true, startsExpr: true }),
    _this: kw("this", startsExpr),
    _super: kw("super", startsExpr),
    _class: kw("class", startsExpr),
    _extends: kw("extends", beforeExpr),
    _export: kw("export"),
    _import: kw("import", startsExpr),
    _null: kw("null", startsExpr),
    _true: kw("true", startsExpr),
    _false: kw("false", startsExpr),
    _in: kw("in", { beforeExpr: true, binop: 7 }),
    _instanceof: kw("instanceof", { beforeExpr: true, binop: 7 }),
    _typeof: kw("typeof", { beforeExpr: true, prefix: true, startsExpr: true }),
    _void: kw("void", { beforeExpr: true, prefix: true, startsExpr: true }),
    _delete: kw("delete", { beforeExpr: true, prefix: true, startsExpr: true })
  };
  var lineBreak = /\r\n?|\n|\u2028|\u2029/;
  var lineBreakG = new RegExp(lineBreak.source, "g");
  function isNewLine(code) {
    return code === 10 || code === 13 || code === 8232 || code === 8233;
  }
  function nextLineBreak(code, from, end) {
    if (end === void 0) end = code.length;
    for (var i2 = from; i2 < end; i2++) {
      var next = code.charCodeAt(i2);
      if (isNewLine(next)) {
        return i2 < end - 1 && next === 13 && code.charCodeAt(i2 + 1) === 10 ? i2 + 2 : i2 + 1;
      }
    }
    return -1;
  }
  var nonASCIIwhitespace = /[\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
  var skipWhiteSpace = /(?:\s|\/\/.*|\/\*[^]*?\*\/)*/g;
  var ref = Object.prototype;
  var hasOwnProperty = ref.hasOwnProperty;
  var toString = ref.toString;
  var hasOwn = Object.hasOwn || (function(obj, propName) {
    return hasOwnProperty.call(obj, propName);
  });
  var isArray = Array.isArray || (function(obj) {
    return toString.call(obj) === "[object Array]";
  });
  var regexpCache = /* @__PURE__ */ Object.create(null);
  function wordsRegexp(words) {
    return regexpCache[words] || (regexpCache[words] = new RegExp("^(?:" + words.replace(/ /g, "|") + ")$"));
  }
  function codePointToString(code) {
    if (code <= 65535) {
      return String.fromCharCode(code);
    }
    code -= 65536;
    return String.fromCharCode((code >> 10) + 55296, (code & 1023) + 56320);
  }
  var loneSurrogate = /(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/;
  var Position = function Position2(line2, col) {
    this.line = line2;
    this.column = col;
  };
  Position.prototype.offset = function offset(n) {
    return new Position(this.line, this.column + n);
  };
  var SourceLocation = function SourceLocation2(p, start, end) {
    this.start = start;
    this.end = end;
    if (p.sourceFile !== null) {
      this.source = p.sourceFile;
    }
  };
  function getLineInfo(input, offset2) {
    for (var line2 = 1, cur = 0; ; ) {
      var nextBreak = nextLineBreak(input, cur, offset2);
      if (nextBreak < 0) {
        return new Position(line2, offset2 - cur);
      }
      ++line2;
      cur = nextBreak;
    }
  }
  var defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must be
    // either 3, 5, 6 (or 2015), 7 (2016), 8 (2017), 9 (2018), 10
    // (2019), 11 (2020), 12 (2021), 13 (2022), 14 (2023), or `"latest"`
    // (the latest version the library supports). This influences
    // support for strict mode, the set of reserved words, and support
    // for new syntax features.
    ecmaVersion: null,
    // `sourceType` indicates the mode the code should be parsed in.
    // Can be either `"script"` or `"module"`. This influences global
    // strict mode and parsing of `import` and `export` declarations.
    sourceType: "script",
    // `onInsertedSemicolon` can be a callback that will be called when
    // a semicolon is automatically inserted. It will be passed the
    // position of the inserted semicolon as an offset, and if
    // `locations` is enabled, it is given the location as a `{line,
    // column}` object as second argument.
    onInsertedSemicolon: null,
    // `onTrailingComma` is similar to `onInsertedSemicolon`, but for
    // trailing commas.
    onTrailingComma: null,
    // By default, reserved words are only enforced if ecmaVersion >= 5.
    // Set `allowReserved` to a boolean value to explicitly turn this on
    // an off. When this option has the value "never", reserved words
    // and keywords can also not be used as property names.
    allowReserved: null,
    // When enabled, a return at the top level is not considered an
    // error.
    allowReturnOutsideFunction: false,
    // When enabled, import/export statements are not constrained to
    // appearing at the top of the program, and an import.meta expression
    // in a script isn't considered an error.
    allowImportExportEverywhere: false,
    // By default, await identifiers are allowed to appear at the top-level scope only if ecmaVersion >= 2022.
    // When enabled, await identifiers are allowed to appear at the top-level scope,
    // but they are still not allowed in non-async functions.
    allowAwaitOutsideFunction: null,
    // When enabled, super identifiers are not constrained to
    // appearing in methods and do not raise an error when they appear elsewhere.
    allowSuperOutsideMethod: null,
    // When enabled, hashbang directive in the beginning of file is
    // allowed and treated as a line comment. Enabled by default when
    // `ecmaVersion` >= 2023.
    allowHashBang: false,
    // By default, the parser will verify that private properties are
    // only used in places where they are valid and have been declared.
    // Set this to false to turn such checks off.
    checkPrivateFields: true,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onToken` option, which will
    // cause Acorn to call that function with object in the same
    // format as tokens returned from `tokenizer().getToken()`. Note
    // that you are not allowed to call the parser from the
    // callback—that will corrupt its internal state.
    onToken: null,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments. Note that you are not allowed to call the
    // parser from the callback—that will corrupt its internal state.
    // When this option has an array as value, objects representing the
    // comments are pushed to it.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `locations` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `locations` is on or off.
    directSourceFile: null,
    // When enabled, parenthesized expressions are represented by
    // (non-standard) ParenthesizedExpression nodes
    preserveParens: false
  };
  var warnedAboutEcmaVersion = false;
  function getOptions(opts) {
    var options = {};
    for (var opt in defaultOptions) {
      options[opt] = opts && hasOwn(opts, opt) ? opts[opt] : defaultOptions[opt];
    }
    if (options.ecmaVersion === "latest") {
      options.ecmaVersion = 1e8;
    } else if (options.ecmaVersion == null) {
      if (!warnedAboutEcmaVersion && typeof console === "object" && console.warn) {
        warnedAboutEcmaVersion = true;
        console.warn("Since Acorn 8.0.0, options.ecmaVersion is required.\nDefaulting to 2020, but this will stop working in the future.");
      }
      options.ecmaVersion = 11;
    } else if (options.ecmaVersion >= 2015) {
      options.ecmaVersion -= 2009;
    }
    if (options.allowReserved == null) {
      options.allowReserved = options.ecmaVersion < 5;
    }
    if (!opts || opts.allowHashBang == null) {
      options.allowHashBang = options.ecmaVersion >= 14;
    }
    if (isArray(options.onToken)) {
      var tokens = options.onToken;
      options.onToken = function(token) {
        return tokens.push(token);
      };
    }
    if (isArray(options.onComment)) {
      options.onComment = pushComment(options, options.onComment);
    }
    return options;
  }
  function pushComment(options, array) {
    return function(block, text, start, end, startLoc, endLoc) {
      var comment = {
        type: block ? "Block" : "Line",
        value: text,
        start,
        end
      };
      if (options.locations) {
        comment.loc = new SourceLocation(this, startLoc, endLoc);
      }
      if (options.ranges) {
        comment.range = [start, end];
      }
      array.push(comment);
    };
  }
  var SCOPE_TOP = 1, SCOPE_FUNCTION = 2, SCOPE_ASYNC = 4, SCOPE_GENERATOR = 8, SCOPE_ARROW = 16, SCOPE_SIMPLE_CATCH = 32, SCOPE_SUPER = 64, SCOPE_DIRECT_SUPER = 128, SCOPE_CLASS_STATIC_BLOCK = 256, SCOPE_CLASS_FIELD_INIT = 512, SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION | SCOPE_CLASS_STATIC_BLOCK;
  function functionFlags(async, generator) {
    return SCOPE_FUNCTION | (async ? SCOPE_ASYNC : 0) | (generator ? SCOPE_GENERATOR : 0);
  }
  var BIND_NONE = 0, BIND_VAR = 1, BIND_LEXICAL = 2, BIND_FUNCTION = 3, BIND_SIMPLE_CATCH = 4, BIND_OUTSIDE = 5;
  var Parser = function Parser2(options, input, startPos) {
    this.options = options = getOptions(options);
    this.sourceFile = options.sourceFile;
    this.keywords = wordsRegexp(keywords$1[options.ecmaVersion >= 6 ? 6 : options.sourceType === "module" ? "5module" : 5]);
    var reserved = "";
    if (options.allowReserved !== true) {
      reserved = reservedWords[options.ecmaVersion >= 6 ? 6 : options.ecmaVersion === 5 ? 5 : 3];
      if (options.sourceType === "module") {
        reserved += " await";
      }
    }
    this.reservedWords = wordsRegexp(reserved);
    var reservedStrict = (reserved ? reserved + " " : "") + reservedWords.strict;
    this.reservedWordsStrict = wordsRegexp(reservedStrict);
    this.reservedWordsStrictBind = wordsRegexp(reservedStrict + " " + reservedWords.strictBind);
    this.input = String(input);
    this.containsEsc = false;
    if (startPos) {
      this.pos = startPos;
      this.lineStart = this.input.lastIndexOf("\n", startPos - 1) + 1;
      this.curLine = this.input.slice(0, this.lineStart).split(lineBreak).length;
    } else {
      this.pos = this.lineStart = 0;
      this.curLine = 1;
    }
    this.type = types$1.eof;
    this.value = null;
    this.start = this.end = this.pos;
    this.startLoc = this.endLoc = this.curPosition();
    this.lastTokEndLoc = this.lastTokStartLoc = null;
    this.lastTokStart = this.lastTokEnd = this.pos;
    this.context = this.initialContext();
    this.exprAllowed = true;
    this.inModule = options.sourceType === "module";
    this.strict = this.inModule || this.strictDirective(this.pos);
    this.potentialArrowAt = -1;
    this.potentialArrowInForAwait = false;
    this.yieldPos = this.awaitPos = this.awaitIdentPos = 0;
    this.labels = [];
    this.undefinedExports = /* @__PURE__ */ Object.create(null);
    if (this.pos === 0 && options.allowHashBang && this.input.slice(0, 2) === "#!") {
      this.skipLineComment(2);
    }
    this.scopeStack = [];
    this.enterScope(SCOPE_TOP);
    this.regexpState = null;
    this.privateNameStack = [];
  };
  var prototypeAccessors = { inFunction: { configurable: true }, inGenerator: { configurable: true }, inAsync: { configurable: true }, canAwait: { configurable: true }, allowSuper: { configurable: true }, allowDirectSuper: { configurable: true }, treatFunctionsAsVar: { configurable: true }, allowNewDotTarget: { configurable: true }, inClassStaticBlock: { configurable: true } };
  Parser.prototype.parse = function parse() {
    var node = this.options.program || this.startNode();
    this.nextToken();
    return this.parseTopLevel(node);
  };
  prototypeAccessors.inFunction.get = function() {
    return (this.currentVarScope().flags & SCOPE_FUNCTION) > 0;
  };
  prototypeAccessors.inGenerator.get = function() {
    return (this.currentVarScope().flags & SCOPE_GENERATOR) > 0;
  };
  prototypeAccessors.inAsync.get = function() {
    return (this.currentVarScope().flags & SCOPE_ASYNC) > 0;
  };
  prototypeAccessors.canAwait.get = function() {
    for (var i2 = this.scopeStack.length - 1; i2 >= 0; i2--) {
      var ref2 = this.scopeStack[i2];
      var flags = ref2.flags;
      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT)) {
        return false;
      }
      if (flags & SCOPE_FUNCTION) {
        return (flags & SCOPE_ASYNC) > 0;
      }
    }
    return this.inModule && this.options.ecmaVersion >= 13 || this.options.allowAwaitOutsideFunction;
  };
  prototypeAccessors.allowSuper.get = function() {
    var ref2 = this.currentThisScope();
    var flags = ref2.flags;
    return (flags & SCOPE_SUPER) > 0 || this.options.allowSuperOutsideMethod;
  };
  prototypeAccessors.allowDirectSuper.get = function() {
    return (this.currentThisScope().flags & SCOPE_DIRECT_SUPER) > 0;
  };
  prototypeAccessors.treatFunctionsAsVar.get = function() {
    return this.treatFunctionsAsVarInScope(this.currentScope());
  };
  prototypeAccessors.allowNewDotTarget.get = function() {
    for (var i2 = this.scopeStack.length - 1; i2 >= 0; i2--) {
      var ref2 = this.scopeStack[i2];
      var flags = ref2.flags;
      if (flags & (SCOPE_CLASS_STATIC_BLOCK | SCOPE_CLASS_FIELD_INIT) || flags & SCOPE_FUNCTION && !(flags & SCOPE_ARROW)) {
        return true;
      }
    }
    return false;
  };
  prototypeAccessors.inClassStaticBlock.get = function() {
    return (this.currentVarScope().flags & SCOPE_CLASS_STATIC_BLOCK) > 0;
  };
  Parser.extend = function extend() {
    var plugins = [], len = arguments.length;
    while (len--) plugins[len] = arguments[len];
    var cls = this;
    for (var i2 = 0; i2 < plugins.length; i2++) {
      cls = plugins[i2](cls);
    }
    return cls;
  };
  Parser.parse = function parse2(input, options) {
    return new this(options, input).parse();
  };
  Parser.parseExpressionAt = function parseExpressionAt(input, pos, options) {
    var parser = new this(options, input, pos);
    parser.nextToken();
    return parser.parseExpression();
  };
  Parser.tokenizer = function tokenizer(input, options) {
    return new this(options, input);
  };
  Object.defineProperties(Parser.prototype, prototypeAccessors);
  var pp$9 = Parser.prototype;
  var literal = /^(?:'((?:\\[^]|[^'\\])*?)'|"((?:\\[^]|[^"\\])*?)")/;
  pp$9.strictDirective = function(start) {
    if (this.options.ecmaVersion < 5) {
      return false;
    }
    for (; ; ) {
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      var match = literal.exec(this.input.slice(start));
      if (!match) {
        return false;
      }
      if ((match[1] || match[2]) === "use strict") {
        skipWhiteSpace.lastIndex = start + match[0].length;
        var spaceAfter = skipWhiteSpace.exec(this.input), end = spaceAfter.index + spaceAfter[0].length;
        var next = this.input.charAt(end);
        return next === ";" || next === "}" || lineBreak.test(spaceAfter[0]) && !(/[(`.[+\-/*%<>=,?^&]/.test(next) || next === "!" && this.input.charAt(end + 1) === "=");
      }
      start += match[0].length;
      skipWhiteSpace.lastIndex = start;
      start += skipWhiteSpace.exec(this.input)[0].length;
      if (this.input[start] === ";") {
        start++;
      }
    }
  };
  pp$9.eat = function(type) {
    if (this.type === type) {
      this.next();
      return true;
    } else {
      return false;
    }
  };
  pp$9.isContextual = function(name) {
    return this.type === types$1.name && this.value === name && !this.containsEsc;
  };
  pp$9.eatContextual = function(name) {
    if (!this.isContextual(name)) {
      return false;
    }
    this.next();
    return true;
  };
  pp$9.expectContextual = function(name) {
    if (!this.eatContextual(name)) {
      this.unexpected();
    }
  };
  pp$9.canInsertSemicolon = function() {
    return this.type === types$1.eof || this.type === types$1.braceR || lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  };
  pp$9.insertSemicolon = function() {
    if (this.canInsertSemicolon()) {
      if (this.options.onInsertedSemicolon) {
        this.options.onInsertedSemicolon(this.lastTokEnd, this.lastTokEndLoc);
      }
      return true;
    }
  };
  pp$9.semicolon = function() {
    if (!this.eat(types$1.semi) && !this.insertSemicolon()) {
      this.unexpected();
    }
  };
  pp$9.afterTrailingComma = function(tokType, notNext) {
    if (this.type === tokType) {
      if (this.options.onTrailingComma) {
        this.options.onTrailingComma(this.lastTokStart, this.lastTokStartLoc);
      }
      if (!notNext) {
        this.next();
      }
      return true;
    }
  };
  pp$9.expect = function(type) {
    this.eat(type) || this.unexpected();
  };
  pp$9.unexpected = function(pos) {
    this.raise(pos != null ? pos : this.start, "Unexpected token");
  };
  var DestructuringErrors = function DestructuringErrors2() {
    this.shorthandAssign = this.trailingComma = this.parenthesizedAssign = this.parenthesizedBind = this.doubleProto = -1;
  };
  pp$9.checkPatternErrors = function(refDestructuringErrors, isAssign) {
    if (!refDestructuringErrors) {
      return;
    }
    if (refDestructuringErrors.trailingComma > -1) {
      this.raiseRecoverable(refDestructuringErrors.trailingComma, "Comma is not permitted after the rest element");
    }
    var parens = isAssign ? refDestructuringErrors.parenthesizedAssign : refDestructuringErrors.parenthesizedBind;
    if (parens > -1) {
      this.raiseRecoverable(parens, isAssign ? "Assigning to rvalue" : "Parenthesized pattern");
    }
  };
  pp$9.checkExpressionErrors = function(refDestructuringErrors, andThrow) {
    if (!refDestructuringErrors) {
      return false;
    }
    var shorthandAssign = refDestructuringErrors.shorthandAssign;
    var doubleProto = refDestructuringErrors.doubleProto;
    if (!andThrow) {
      return shorthandAssign >= 0 || doubleProto >= 0;
    }
    if (shorthandAssign >= 0) {
      this.raise(shorthandAssign, "Shorthand property assignments are valid only in destructuring patterns");
    }
    if (doubleProto >= 0) {
      this.raiseRecoverable(doubleProto, "Redefinition of __proto__ property");
    }
  };
  pp$9.checkYieldAwaitInDefaultParams = function() {
    if (this.yieldPos && (!this.awaitPos || this.yieldPos < this.awaitPos)) {
      this.raise(this.yieldPos, "Yield expression cannot be a default value");
    }
    if (this.awaitPos) {
      this.raise(this.awaitPos, "Await expression cannot be a default value");
    }
  };
  pp$9.isSimpleAssignTarget = function(expr) {
    if (expr.type === "ParenthesizedExpression") {
      return this.isSimpleAssignTarget(expr.expression);
    }
    return expr.type === "Identifier" || expr.type === "MemberExpression";
  };
  var pp$8 = Parser.prototype;
  pp$8.parseTopLevel = function(node) {
    var exports$1 = /* @__PURE__ */ Object.create(null);
    if (!node.body) {
      node.body = [];
    }
    while (this.type !== types$1.eof) {
      var stmt = this.parseStatement(null, true, exports$1);
      node.body.push(stmt);
    }
    if (this.inModule) {
      for (var i2 = 0, list2 = Object.keys(this.undefinedExports); i2 < list2.length; i2 += 1) {
        var name = list2[i2];
        this.raiseRecoverable(this.undefinedExports[name].start, "Export '" + name + "' is not defined");
      }
    }
    this.adaptDirectivePrologue(node.body);
    this.next();
    node.sourceType = this.options.sourceType;
    return this.finishNode(node, "Program");
  };
  var loopLabel = { kind: "loop" }, switchLabel = { kind: "switch" };
  pp$8.isLet = function(context) {
    if (this.options.ecmaVersion < 6 || !this.isContextual("let")) {
      return false;
    }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
    if (nextCh === 91 || nextCh === 92) {
      return true;
    }
    if (context) {
      return false;
    }
    if (nextCh === 123 || nextCh > 55295 && nextCh < 56320) {
      return true;
    }
    if (isIdentifierStart(nextCh, true)) {
      var pos = next + 1;
      while (isIdentifierChar(nextCh = this.input.charCodeAt(pos), true)) {
        ++pos;
      }
      if (nextCh === 92 || nextCh > 55295 && nextCh < 56320) {
        return true;
      }
      var ident = this.input.slice(next, pos);
      if (!keywordRelationalOperator.test(ident)) {
        return true;
      }
    }
    return false;
  };
  pp$8.isAsyncFunction = function() {
    if (this.options.ecmaVersion < 8 || !this.isContextual("async")) {
      return false;
    }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length, after;
    return !lineBreak.test(this.input.slice(this.pos, next)) && this.input.slice(next, next + 8) === "function" && (next + 8 === this.input.length || !(isIdentifierChar(after = this.input.charCodeAt(next + 8)) || after > 55295 && after < 56320));
  };
  pp$8.isUsingKeyword = function(isAwaitUsing, isFor) {
    if (this.options.ecmaVersion < 17 || !this.isContextual(isAwaitUsing ? "await" : "using")) {
      return false;
    }
    skipWhiteSpace.lastIndex = this.pos;
    var skip = skipWhiteSpace.exec(this.input);
    var next = this.pos + skip[0].length;
    if (lineBreak.test(this.input.slice(this.pos, next))) {
      return false;
    }
    if (isAwaitUsing) {
      var awaitEndPos = next + 5, after;
      if (this.input.slice(next, awaitEndPos) !== "using" || awaitEndPos === this.input.length || isIdentifierChar(after = this.input.charCodeAt(awaitEndPos)) || after > 55295 && after < 56320) {
        return false;
      }
      skipWhiteSpace.lastIndex = awaitEndPos;
      var skipAfterUsing = skipWhiteSpace.exec(this.input);
      if (skipAfterUsing && lineBreak.test(this.input.slice(awaitEndPos, awaitEndPos + skipAfterUsing[0].length))) {
        return false;
      }
    }
    if (isFor) {
      var ofEndPos = next + 2, after$1;
      if (this.input.slice(next, ofEndPos) === "of") {
        if (ofEndPos === this.input.length || !isIdentifierChar(after$1 = this.input.charCodeAt(ofEndPos)) && !(after$1 > 55295 && after$1 < 56320)) {
          return false;
        }
      }
    }
    var ch = this.input.charCodeAt(next);
    return isIdentifierStart(ch, true) || ch === 92;
  };
  pp$8.isAwaitUsing = function(isFor) {
    return this.isUsingKeyword(true, isFor);
  };
  pp$8.isUsing = function(isFor) {
    return this.isUsingKeyword(false, isFor);
  };
  pp$8.parseStatement = function(context, topLevel, exports$1) {
    var starttype = this.type, node = this.startNode(), kind;
    if (this.isLet(context)) {
      starttype = types$1._var;
      kind = "let";
    }
    switch (starttype) {
      case types$1._break:
      case types$1._continue:
        return this.parseBreakContinueStatement(node, starttype.keyword);
      case types$1._debugger:
        return this.parseDebuggerStatement(node);
      case types$1._do:
        return this.parseDoStatement(node);
      case types$1._for:
        return this.parseForStatement(node);
      case types$1._function:
        if (context && (this.strict || context !== "if" && context !== "label") && this.options.ecmaVersion >= 6) {
          this.unexpected();
        }
        return this.parseFunctionStatement(node, false, !context);
      case types$1._class:
        if (context) {
          this.unexpected();
        }
        return this.parseClass(node, true);
      case types$1._if:
        return this.parseIfStatement(node);
      case types$1._return:
        return this.parseReturnStatement(node);
      case types$1._switch:
        return this.parseSwitchStatement(node);
      case types$1._throw:
        return this.parseThrowStatement(node);
      case types$1._try:
        return this.parseTryStatement(node);
      case types$1._const:
      case types$1._var:
        kind = kind || this.value;
        if (context && kind !== "var") {
          this.unexpected();
        }
        return this.parseVarStatement(node, kind);
      case types$1._while:
        return this.parseWhileStatement(node);
      case types$1._with:
        return this.parseWithStatement(node);
      case types$1.braceL:
        return this.parseBlock(true, node);
      case types$1.semi:
        return this.parseEmptyStatement(node);
      case types$1._export:
      case types$1._import:
        if (this.options.ecmaVersion > 10 && starttype === types$1._import) {
          skipWhiteSpace.lastIndex = this.pos;
          var skip = skipWhiteSpace.exec(this.input);
          var next = this.pos + skip[0].length, nextCh = this.input.charCodeAt(next);
          if (nextCh === 40 || nextCh === 46) {
            return this.parseExpressionStatement(node, this.parseExpression());
          }
        }
        if (!this.options.allowImportExportEverywhere) {
          if (!topLevel) {
            this.raise(this.start, "'import' and 'export' may only appear at the top level");
          }
          if (!this.inModule) {
            this.raise(this.start, "'import' and 'export' may appear only with 'sourceType: module'");
          }
        }
        return starttype === types$1._import ? this.parseImport(node) : this.parseExport(node, exports$1);
      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.
      default:
        if (this.isAsyncFunction()) {
          if (context) {
            this.unexpected();
          }
          this.next();
          return this.parseFunctionStatement(node, true, !context);
        }
        var usingKind = this.isAwaitUsing(false) ? "await using" : this.isUsing(false) ? "using" : null;
        if (usingKind) {
          if (topLevel && this.options.sourceType === "script") {
            this.raise(this.start, "Using declaration cannot appear in the top level when source type is `script`");
          }
          if (usingKind === "await using") {
            if (!this.canAwait) {
              this.raise(this.start, "Await using cannot appear outside of async function");
            }
            this.next();
          }
          this.next();
          this.parseVar(node, false, usingKind);
          this.semicolon();
          return this.finishNode(node, "VariableDeclaration");
        }
        var maybeName = this.value, expr = this.parseExpression();
        if (starttype === types$1.name && expr.type === "Identifier" && this.eat(types$1.colon)) {
          return this.parseLabeledStatement(node, maybeName, expr, context);
        } else {
          return this.parseExpressionStatement(node, expr);
        }
    }
  };
  pp$8.parseBreakContinueStatement = function(node, keyword) {
    var isBreak = keyword === "break";
    this.next();
    if (this.eat(types$1.semi) || this.insertSemicolon()) {
      node.label = null;
    } else if (this.type !== types$1.name) {
      this.unexpected();
    } else {
      node.label = this.parseIdent();
      this.semicolon();
    }
    var i2 = 0;
    for (; i2 < this.labels.length; ++i2) {
      var lab = this.labels[i2];
      if (node.label == null || lab.name === node.label.name) {
        if (lab.kind != null && (isBreak || lab.kind === "loop")) {
          break;
        }
        if (node.label && isBreak) {
          break;
        }
      }
    }
    if (i2 === this.labels.length) {
      this.raise(node.start, "Unsyntactic " + keyword);
    }
    return this.finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");
  };
  pp$8.parseDebuggerStatement = function(node) {
    this.next();
    this.semicolon();
    return this.finishNode(node, "DebuggerStatement");
  };
  pp$8.parseDoStatement = function(node) {
    this.next();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("do");
    this.labels.pop();
    this.expect(types$1._while);
    node.test = this.parseParenExpression();
    if (this.options.ecmaVersion >= 6) {
      this.eat(types$1.semi);
    } else {
      this.semicolon();
    }
    return this.finishNode(node, "DoWhileStatement");
  };
  pp$8.parseForStatement = function(node) {
    this.next();
    var awaitAt = this.options.ecmaVersion >= 9 && this.canAwait && this.eatContextual("await") ? this.lastTokStart : -1;
    this.labels.push(loopLabel);
    this.enterScope(0);
    this.expect(types$1.parenL);
    if (this.type === types$1.semi) {
      if (awaitAt > -1) {
        this.unexpected(awaitAt);
      }
      return this.parseFor(node, null);
    }
    var isLet = this.isLet();
    if (this.type === types$1._var || this.type === types$1._const || isLet) {
      var init$1 = this.startNode(), kind = isLet ? "let" : this.value;
      this.next();
      this.parseVar(init$1, true, kind);
      this.finishNode(init$1, "VariableDeclaration");
      return this.parseForAfterInit(node, init$1, awaitAt);
    }
    var startsWithLet = this.isContextual("let"), isForOf = false;
    var usingKind = this.isUsing(true) ? "using" : this.isAwaitUsing(true) ? "await using" : null;
    if (usingKind) {
      var init$2 = this.startNode();
      this.next();
      if (usingKind === "await using") {
        this.next();
      }
      this.parseVar(init$2, true, usingKind);
      this.finishNode(init$2, "VariableDeclaration");
      return this.parseForAfterInit(node, init$2, awaitAt);
    }
    var containsEsc = this.containsEsc;
    var refDestructuringErrors = new DestructuringErrors();
    var initPos = this.start;
    var init = awaitAt > -1 ? this.parseExprSubscripts(refDestructuringErrors, "await") : this.parseExpression(true, refDestructuringErrors);
    if (this.type === types$1._in || (isForOf = this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
      if (awaitAt > -1) {
        if (this.type === types$1._in) {
          this.unexpected(awaitAt);
        }
        node.await = true;
      } else if (isForOf && this.options.ecmaVersion >= 8) {
        if (init.start === initPos && !containsEsc && init.type === "Identifier" && init.name === "async") {
          this.unexpected();
        } else if (this.options.ecmaVersion >= 9) {
          node.await = false;
        }
      }
      if (startsWithLet && isForOf) {
        this.raise(init.start, "The left-hand side of a for-of loop may not start with 'let'.");
      }
      this.toAssignable(init, false, refDestructuringErrors);
      this.checkLValPattern(init);
      return this.parseForIn(node, init);
    } else {
      this.checkExpressionErrors(refDestructuringErrors, true);
    }
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, init);
  };
  pp$8.parseForAfterInit = function(node, init, awaitAt) {
    if ((this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of")) && init.declarations.length === 1) {
      if (this.options.ecmaVersion >= 9) {
        if (this.type === types$1._in) {
          if (awaitAt > -1) {
            this.unexpected(awaitAt);
          }
        } else {
          node.await = awaitAt > -1;
        }
      }
      return this.parseForIn(node, init);
    }
    if (awaitAt > -1) {
      this.unexpected(awaitAt);
    }
    return this.parseFor(node, init);
  };
  pp$8.parseFunctionStatement = function(node, isAsync, declarationPosition) {
    this.next();
    return this.parseFunction(node, FUNC_STATEMENT | (declarationPosition ? 0 : FUNC_HANGING_STATEMENT), false, isAsync);
  };
  pp$8.parseIfStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    node.consequent = this.parseStatement("if");
    node.alternate = this.eat(types$1._else) ? this.parseStatement("if") : null;
    return this.finishNode(node, "IfStatement");
  };
  pp$8.parseReturnStatement = function(node) {
    if (!this.inFunction && !this.options.allowReturnOutsideFunction) {
      this.raise(this.start, "'return' outside of function");
    }
    this.next();
    if (this.eat(types$1.semi) || this.insertSemicolon()) {
      node.argument = null;
    } else {
      node.argument = this.parseExpression();
      this.semicolon();
    }
    return this.finishNode(node, "ReturnStatement");
  };
  pp$8.parseSwitchStatement = function(node) {
    this.next();
    node.discriminant = this.parseParenExpression();
    node.cases = [];
    this.expect(types$1.braceL);
    this.labels.push(switchLabel);
    this.enterScope(0);
    var cur;
    for (var sawDefault = false; this.type !== types$1.braceR; ) {
      if (this.type === types$1._case || this.type === types$1._default) {
        var isCase = this.type === types$1._case;
        if (cur) {
          this.finishNode(cur, "SwitchCase");
        }
        node.cases.push(cur = this.startNode());
        cur.consequent = [];
        this.next();
        if (isCase) {
          cur.test = this.parseExpression();
        } else {
          if (sawDefault) {
            this.raiseRecoverable(this.lastTokStart, "Multiple default clauses");
          }
          sawDefault = true;
          cur.test = null;
        }
        this.expect(types$1.colon);
      } else {
        if (!cur) {
          this.unexpected();
        }
        cur.consequent.push(this.parseStatement(null));
      }
    }
    this.exitScope();
    if (cur) {
      this.finishNode(cur, "SwitchCase");
    }
    this.next();
    this.labels.pop();
    return this.finishNode(node, "SwitchStatement");
  };
  pp$8.parseThrowStatement = function(node) {
    this.next();
    if (lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) {
      this.raise(this.lastTokEnd, "Illegal newline after throw");
    }
    node.argument = this.parseExpression();
    this.semicolon();
    return this.finishNode(node, "ThrowStatement");
  };
  var empty$1 = [];
  pp$8.parseCatchClauseParam = function() {
    var param = this.parseBindingAtom();
    var simple = param.type === "Identifier";
    this.enterScope(simple ? SCOPE_SIMPLE_CATCH : 0);
    this.checkLValPattern(param, simple ? BIND_SIMPLE_CATCH : BIND_LEXICAL);
    this.expect(types$1.parenR);
    return param;
  };
  pp$8.parseTryStatement = function(node) {
    this.next();
    node.block = this.parseBlock();
    node.handler = null;
    if (this.type === types$1._catch) {
      var clause = this.startNode();
      this.next();
      if (this.eat(types$1.parenL)) {
        clause.param = this.parseCatchClauseParam();
      } else {
        if (this.options.ecmaVersion < 10) {
          this.unexpected();
        }
        clause.param = null;
        this.enterScope(0);
      }
      clause.body = this.parseBlock(false);
      this.exitScope();
      node.handler = this.finishNode(clause, "CatchClause");
    }
    node.finalizer = this.eat(types$1._finally) ? this.parseBlock() : null;
    if (!node.handler && !node.finalizer) {
      this.raise(node.start, "Missing catch or finally clause");
    }
    return this.finishNode(node, "TryStatement");
  };
  pp$8.parseVarStatement = function(node, kind, allowMissingInitializer) {
    this.next();
    this.parseVar(node, false, kind, allowMissingInitializer);
    this.semicolon();
    return this.finishNode(node, "VariableDeclaration");
  };
  pp$8.parseWhileStatement = function(node) {
    this.next();
    node.test = this.parseParenExpression();
    this.labels.push(loopLabel);
    node.body = this.parseStatement("while");
    this.labels.pop();
    return this.finishNode(node, "WhileStatement");
  };
  pp$8.parseWithStatement = function(node) {
    if (this.strict) {
      this.raise(this.start, "'with' in strict mode");
    }
    this.next();
    node.object = this.parseParenExpression();
    node.body = this.parseStatement("with");
    return this.finishNode(node, "WithStatement");
  };
  pp$8.parseEmptyStatement = function(node) {
    this.next();
    return this.finishNode(node, "EmptyStatement");
  };
  pp$8.parseLabeledStatement = function(node, maybeName, expr, context) {
    for (var i$1 = 0, list2 = this.labels; i$1 < list2.length; i$1 += 1) {
      var label = list2[i$1];
      if (label.name === maybeName) {
        this.raise(expr.start, "Label '" + maybeName + "' is already declared");
      }
    }
    var kind = this.type.isLoop ? "loop" : this.type === types$1._switch ? "switch" : null;
    for (var i2 = this.labels.length - 1; i2 >= 0; i2--) {
      var label$1 = this.labels[i2];
      if (label$1.statementStart === node.start) {
        label$1.statementStart = this.start;
        label$1.kind = kind;
      } else {
        break;
      }
    }
    this.labels.push({ name: maybeName, kind, statementStart: this.start });
    node.body = this.parseStatement(context ? context.indexOf("label") === -1 ? context + "label" : context : "label");
    this.labels.pop();
    node.label = expr;
    return this.finishNode(node, "LabeledStatement");
  };
  pp$8.parseExpressionStatement = function(node, expr) {
    node.expression = expr;
    this.semicolon();
    return this.finishNode(node, "ExpressionStatement");
  };
  pp$8.parseBlock = function(createNewLexicalScope, node, exitStrict) {
    if (createNewLexicalScope === void 0) createNewLexicalScope = true;
    if (node === void 0) node = this.startNode();
    node.body = [];
    this.expect(types$1.braceL);
    if (createNewLexicalScope) {
      this.enterScope(0);
    }
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    if (exitStrict) {
      this.strict = false;
    }
    this.next();
    if (createNewLexicalScope) {
      this.exitScope();
    }
    return this.finishNode(node, "BlockStatement");
  };
  pp$8.parseFor = function(node, init) {
    node.init = init;
    this.expect(types$1.semi);
    node.test = this.type === types$1.semi ? null : this.parseExpression();
    this.expect(types$1.semi);
    node.update = this.type === types$1.parenR ? null : this.parseExpression();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, "ForStatement");
  };
  pp$8.parseForIn = function(node, init) {
    var isForIn = this.type === types$1._in;
    this.next();
    if (init.type === "VariableDeclaration" && init.declarations[0].init != null && (!isForIn || this.options.ecmaVersion < 8 || this.strict || init.kind !== "var" || init.declarations[0].id.type !== "Identifier")) {
      this.raise(
        init.start,
        (isForIn ? "for-in" : "for-of") + " loop variable declaration may not have an initializer"
      );
    }
    node.left = init;
    node.right = isForIn ? this.parseExpression() : this.parseMaybeAssign();
    this.expect(types$1.parenR);
    node.body = this.parseStatement("for");
    this.exitScope();
    this.labels.pop();
    return this.finishNode(node, isForIn ? "ForInStatement" : "ForOfStatement");
  };
  pp$8.parseVar = function(node, isFor, kind, allowMissingInitializer) {
    node.declarations = [];
    node.kind = kind;
    for (; ; ) {
      var decl = this.startNode();
      this.parseVarId(decl, kind);
      if (this.eat(types$1.eq)) {
        decl.init = this.parseMaybeAssign(isFor);
      } else if (!allowMissingInitializer && kind === "const" && !(this.type === types$1._in || this.options.ecmaVersion >= 6 && this.isContextual("of"))) {
        this.unexpected();
      } else if (!allowMissingInitializer && (kind === "using" || kind === "await using") && this.options.ecmaVersion >= 17 && this.type !== types$1._in && !this.isContextual("of")) {
        this.raise(this.lastTokEnd, "Missing initializer in " + kind + " declaration");
      } else if (!allowMissingInitializer && decl.id.type !== "Identifier" && !(isFor && (this.type === types$1._in || this.isContextual("of")))) {
        this.raise(this.lastTokEnd, "Complex binding patterns require an initialization value");
      } else {
        decl.init = null;
      }
      node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
      if (!this.eat(types$1.comma)) {
        break;
      }
    }
    return node;
  };
  pp$8.parseVarId = function(decl, kind) {
    decl.id = kind === "using" || kind === "await using" ? this.parseIdent() : this.parseBindingAtom();
    this.checkLValPattern(decl.id, kind === "var" ? BIND_VAR : BIND_LEXICAL, false);
  };
  var FUNC_STATEMENT = 1, FUNC_HANGING_STATEMENT = 2, FUNC_NULLABLE_ID = 4;
  pp$8.parseFunction = function(node, statement, allowExpressionBody, isAsync, forInit) {
    this.initFunction(node);
    if (this.options.ecmaVersion >= 9 || this.options.ecmaVersion >= 6 && !isAsync) {
      if (this.type === types$1.star && statement & FUNC_HANGING_STATEMENT) {
        this.unexpected();
      }
      node.generator = this.eat(types$1.star);
    }
    if (this.options.ecmaVersion >= 8) {
      node.async = !!isAsync;
    }
    if (statement & FUNC_STATEMENT) {
      node.id = statement & FUNC_NULLABLE_ID && this.type !== types$1.name ? null : this.parseIdent();
      if (node.id && !(statement & FUNC_HANGING_STATEMENT)) {
        this.checkLValSimple(node.id, this.strict || node.generator || node.async ? this.treatFunctionsAsVar ? BIND_VAR : BIND_LEXICAL : BIND_FUNCTION);
      }
    }
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(node.async, node.generator));
    if (!(statement & FUNC_STATEMENT)) {
      node.id = this.type === types$1.name ? this.parseIdent() : null;
    }
    this.parseFunctionParams(node);
    this.parseFunctionBody(node, allowExpressionBody, false, forInit);
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, statement & FUNC_STATEMENT ? "FunctionDeclaration" : "FunctionExpression");
  };
  pp$8.parseFunctionParams = function(node) {
    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
  };
  pp$8.parseClass = function(node, isStatement) {
    this.next();
    var oldStrict = this.strict;
    this.strict = true;
    this.parseClassId(node, isStatement);
    this.parseClassSuper(node);
    var privateNameMap = this.enterClassBody();
    var classBody = this.startNode();
    var hadConstructor = false;
    classBody.body = [];
    this.expect(types$1.braceL);
    while (this.type !== types$1.braceR) {
      var element = this.parseClassElement(node.superClass !== null);
      if (element) {
        classBody.body.push(element);
        if (element.type === "MethodDefinition" && element.kind === "constructor") {
          if (hadConstructor) {
            this.raiseRecoverable(element.start, "Duplicate constructor in the same class");
          }
          hadConstructor = true;
        } else if (element.key && element.key.type === "PrivateIdentifier" && isPrivateNameConflicted(privateNameMap, element)) {
          this.raiseRecoverable(element.key.start, "Identifier '#" + element.key.name + "' has already been declared");
        }
      }
    }
    this.strict = oldStrict;
    this.next();
    node.body = this.finishNode(classBody, "ClassBody");
    this.exitClassBody();
    return this.finishNode(node, isStatement ? "ClassDeclaration" : "ClassExpression");
  };
  pp$8.parseClassElement = function(constructorAllowsSuper) {
    if (this.eat(types$1.semi)) {
      return null;
    }
    var ecmaVersion2 = this.options.ecmaVersion;
    var node = this.startNode();
    var keyName = "";
    var isGenerator = false;
    var isAsync = false;
    var kind = "method";
    var isStatic = false;
    if (this.eatContextual("static")) {
      if (ecmaVersion2 >= 13 && this.eat(types$1.braceL)) {
        this.parseClassStaticBlock(node);
        return node;
      }
      if (this.isClassElementNameStart() || this.type === types$1.star) {
        isStatic = true;
      } else {
        keyName = "static";
      }
    }
    node.static = isStatic;
    if (!keyName && ecmaVersion2 >= 8 && this.eatContextual("async")) {
      if ((this.isClassElementNameStart() || this.type === types$1.star) && !this.canInsertSemicolon()) {
        isAsync = true;
      } else {
        keyName = "async";
      }
    }
    if (!keyName && (ecmaVersion2 >= 9 || !isAsync) && this.eat(types$1.star)) {
      isGenerator = true;
    }
    if (!keyName && !isAsync && !isGenerator) {
      var lastValue = this.value;
      if (this.eatContextual("get") || this.eatContextual("set")) {
        if (this.isClassElementNameStart()) {
          kind = lastValue;
        } else {
          keyName = lastValue;
        }
      }
    }
    if (keyName) {
      node.computed = false;
      node.key = this.startNodeAt(this.lastTokStart, this.lastTokStartLoc);
      node.key.name = keyName;
      this.finishNode(node.key, "Identifier");
    } else {
      this.parseClassElementName(node);
    }
    if (ecmaVersion2 < 13 || this.type === types$1.parenL || kind !== "method" || isGenerator || isAsync) {
      var isConstructor = !node.static && checkKeyName(node, "constructor");
      var allowsDirectSuper = isConstructor && constructorAllowsSuper;
      if (isConstructor && kind !== "method") {
        this.raise(node.key.start, "Constructor can't have get/set modifier");
      }
      node.kind = isConstructor ? "constructor" : kind;
      this.parseClassMethod(node, isGenerator, isAsync, allowsDirectSuper);
    } else {
      this.parseClassField(node);
    }
    return node;
  };
  pp$8.isClassElementNameStart = function() {
    return this.type === types$1.name || this.type === types$1.privateId || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword;
  };
  pp$8.parseClassElementName = function(element) {
    if (this.type === types$1.privateId) {
      if (this.value === "constructor") {
        this.raise(this.start, "Classes can't have an element named '#constructor'");
      }
      element.computed = false;
      element.key = this.parsePrivateIdent();
    } else {
      this.parsePropertyName(element);
    }
  };
  pp$8.parseClassMethod = function(method, isGenerator, isAsync, allowsDirectSuper) {
    var key = method.key;
    if (method.kind === "constructor") {
      if (isGenerator) {
        this.raise(key.start, "Constructor can't be a generator");
      }
      if (isAsync) {
        this.raise(key.start, "Constructor can't be an async method");
      }
    } else if (method.static && checkKeyName(method, "prototype")) {
      this.raise(key.start, "Classes may not have a static property named prototype");
    }
    var value = method.value = this.parseMethod(isGenerator, isAsync, allowsDirectSuper);
    if (method.kind === "get" && value.params.length !== 0) {
      this.raiseRecoverable(value.start, "getter should have no params");
    }
    if (method.kind === "set" && value.params.length !== 1) {
      this.raiseRecoverable(value.start, "setter should have exactly one param");
    }
    if (method.kind === "set" && value.params[0].type === "RestElement") {
      this.raiseRecoverable(value.params[0].start, "Setter cannot use rest params");
    }
    return this.finishNode(method, "MethodDefinition");
  };
  pp$8.parseClassField = function(field) {
    if (checkKeyName(field, "constructor")) {
      this.raise(field.key.start, "Classes can't have a field named 'constructor'");
    } else if (field.static && checkKeyName(field, "prototype")) {
      this.raise(field.key.start, "Classes can't have a static field named 'prototype'");
    }
    if (this.eat(types$1.eq)) {
      this.enterScope(SCOPE_CLASS_FIELD_INIT | SCOPE_SUPER);
      field.value = this.parseMaybeAssign();
      this.exitScope();
    } else {
      field.value = null;
    }
    this.semicolon();
    return this.finishNode(field, "PropertyDefinition");
  };
  pp$8.parseClassStaticBlock = function(node) {
    node.body = [];
    var oldLabels = this.labels;
    this.labels = [];
    this.enterScope(SCOPE_CLASS_STATIC_BLOCK | SCOPE_SUPER);
    while (this.type !== types$1.braceR) {
      var stmt = this.parseStatement(null);
      node.body.push(stmt);
    }
    this.next();
    this.exitScope();
    this.labels = oldLabels;
    return this.finishNode(node, "StaticBlock");
  };
  pp$8.parseClassId = function(node, isStatement) {
    if (this.type === types$1.name) {
      node.id = this.parseIdent();
      if (isStatement) {
        this.checkLValSimple(node.id, BIND_LEXICAL, false);
      }
    } else {
      if (isStatement === true) {
        this.unexpected();
      }
      node.id = null;
    }
  };
  pp$8.parseClassSuper = function(node) {
    node.superClass = this.eat(types$1._extends) ? this.parseExprSubscripts(null, false) : null;
  };
  pp$8.enterClassBody = function() {
    var element = { declared: /* @__PURE__ */ Object.create(null), used: [] };
    this.privateNameStack.push(element);
    return element.declared;
  };
  pp$8.exitClassBody = function() {
    var ref2 = this.privateNameStack.pop();
    var declared = ref2.declared;
    var used = ref2.used;
    if (!this.options.checkPrivateFields) {
      return;
    }
    var len = this.privateNameStack.length;
    var parent = len === 0 ? null : this.privateNameStack[len - 1];
    for (var i2 = 0; i2 < used.length; ++i2) {
      var id = used[i2];
      if (!hasOwn(declared, id.name)) {
        if (parent) {
          parent.used.push(id);
        } else {
          this.raiseRecoverable(id.start, "Private field '#" + id.name + "' must be declared in an enclosing class");
        }
      }
    }
  };
  function isPrivateNameConflicted(privateNameMap, element) {
    var name = element.key.name;
    var curr = privateNameMap[name];
    var next = "true";
    if (element.type === "MethodDefinition" && (element.kind === "get" || element.kind === "set")) {
      next = (element.static ? "s" : "i") + element.kind;
    }
    if (curr === "iget" && next === "iset" || curr === "iset" && next === "iget" || curr === "sget" && next === "sset" || curr === "sset" && next === "sget") {
      privateNameMap[name] = "true";
      return false;
    } else if (!curr) {
      privateNameMap[name] = next;
      return false;
    } else {
      return true;
    }
  }
  function checkKeyName(node, name) {
    var computed = node.computed;
    var key = node.key;
    return !computed && (key.type === "Identifier" && key.name === name || key.type === "Literal" && key.value === name);
  }
  pp$8.parseExportAllDeclaration = function(node, exports$1) {
    if (this.options.ecmaVersion >= 11) {
      if (this.eatContextual("as")) {
        node.exported = this.parseModuleExportName();
        this.checkExport(exports$1, node.exported, this.lastTokStart);
      } else {
        node.exported = null;
      }
    }
    this.expectContextual("from");
    if (this.type !== types$1.string) {
      this.unexpected();
    }
    node.source = this.parseExprAtom();
    if (this.options.ecmaVersion >= 16) {
      node.attributes = this.parseWithClause();
    }
    this.semicolon();
    return this.finishNode(node, "ExportAllDeclaration");
  };
  pp$8.parseExport = function(node, exports$1) {
    this.next();
    if (this.eat(types$1.star)) {
      return this.parseExportAllDeclaration(node, exports$1);
    }
    if (this.eat(types$1._default)) {
      this.checkExport(exports$1, "default", this.lastTokStart);
      node.declaration = this.parseExportDefaultDeclaration();
      return this.finishNode(node, "ExportDefaultDeclaration");
    }
    if (this.shouldParseExportStatement()) {
      node.declaration = this.parseExportDeclaration(node);
      if (node.declaration.type === "VariableDeclaration") {
        this.checkVariableExport(exports$1, node.declaration.declarations);
      } else {
        this.checkExport(exports$1, node.declaration.id, node.declaration.id.start);
      }
      node.specifiers = [];
      node.source = null;
      if (this.options.ecmaVersion >= 16) {
        node.attributes = [];
      }
    } else {
      node.declaration = null;
      node.specifiers = this.parseExportSpecifiers(exports$1);
      if (this.eatContextual("from")) {
        if (this.type !== types$1.string) {
          this.unexpected();
        }
        node.source = this.parseExprAtom();
        if (this.options.ecmaVersion >= 16) {
          node.attributes = this.parseWithClause();
        }
      } else {
        for (var i2 = 0, list2 = node.specifiers; i2 < list2.length; i2 += 1) {
          var spec = list2[i2];
          this.checkUnreserved(spec.local);
          this.checkLocalExport(spec.local);
          if (spec.local.type === "Literal") {
            this.raise(spec.local.start, "A string literal cannot be used as an exported binding without `from`.");
          }
        }
        node.source = null;
        if (this.options.ecmaVersion >= 16) {
          node.attributes = [];
        }
      }
      this.semicolon();
    }
    return this.finishNode(node, "ExportNamedDeclaration");
  };
  pp$8.parseExportDeclaration = function(node) {
    return this.parseStatement(null);
  };
  pp$8.parseExportDefaultDeclaration = function() {
    var isAsync;
    if (this.type === types$1._function || (isAsync = this.isAsyncFunction())) {
      var fNode = this.startNode();
      this.next();
      if (isAsync) {
        this.next();
      }
      return this.parseFunction(fNode, FUNC_STATEMENT | FUNC_NULLABLE_ID, false, isAsync);
    } else if (this.type === types$1._class) {
      var cNode = this.startNode();
      return this.parseClass(cNode, "nullableID");
    } else {
      var declaration = this.parseMaybeAssign();
      this.semicolon();
      return declaration;
    }
  };
  pp$8.checkExport = function(exports$1, name, pos) {
    if (!exports$1) {
      return;
    }
    if (typeof name !== "string") {
      name = name.type === "Identifier" ? name.name : name.value;
    }
    if (hasOwn(exports$1, name)) {
      this.raiseRecoverable(pos, "Duplicate export '" + name + "'");
    }
    exports$1[name] = true;
  };
  pp$8.checkPatternExport = function(exports$1, pat) {
    var type = pat.type;
    if (type === "Identifier") {
      this.checkExport(exports$1, pat, pat.start);
    } else if (type === "ObjectPattern") {
      for (var i2 = 0, list2 = pat.properties; i2 < list2.length; i2 += 1) {
        var prop = list2[i2];
        this.checkPatternExport(exports$1, prop);
      }
    } else if (type === "ArrayPattern") {
      for (var i$1 = 0, list$1 = pat.elements; i$1 < list$1.length; i$1 += 1) {
        var elt = list$1[i$1];
        if (elt) {
          this.checkPatternExport(exports$1, elt);
        }
      }
    } else if (type === "Property") {
      this.checkPatternExport(exports$1, pat.value);
    } else if (type === "AssignmentPattern") {
      this.checkPatternExport(exports$1, pat.left);
    } else if (type === "RestElement") {
      this.checkPatternExport(exports$1, pat.argument);
    }
  };
  pp$8.checkVariableExport = function(exports$1, decls) {
    if (!exports$1) {
      return;
    }
    for (var i2 = 0, list2 = decls; i2 < list2.length; i2 += 1) {
      var decl = list2[i2];
      this.checkPatternExport(exports$1, decl.id);
    }
  };
  pp$8.shouldParseExportStatement = function() {
    return this.type.keyword === "var" || this.type.keyword === "const" || this.type.keyword === "class" || this.type.keyword === "function" || this.isLet() || this.isAsyncFunction();
  };
  pp$8.parseExportSpecifier = function(exports$1) {
    var node = this.startNode();
    node.local = this.parseModuleExportName();
    node.exported = this.eatContextual("as") ? this.parseModuleExportName() : node.local;
    this.checkExport(
      exports$1,
      node.exported,
      node.exported.start
    );
    return this.finishNode(node, "ExportSpecifier");
  };
  pp$8.parseExportSpecifiers = function(exports$1) {
    var nodes = [], first = true;
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      nodes.push(this.parseExportSpecifier(exports$1));
    }
    return nodes;
  };
  pp$8.parseImport = function(node) {
    this.next();
    if (this.type === types$1.string) {
      node.specifiers = empty$1;
      node.source = this.parseExprAtom();
    } else {
      node.specifiers = this.parseImportSpecifiers();
      this.expectContextual("from");
      node.source = this.type === types$1.string ? this.parseExprAtom() : this.unexpected();
    }
    if (this.options.ecmaVersion >= 16) {
      node.attributes = this.parseWithClause();
    }
    this.semicolon();
    return this.finishNode(node, "ImportDeclaration");
  };
  pp$8.parseImportSpecifier = function() {
    var node = this.startNode();
    node.imported = this.parseModuleExportName();
    if (this.eatContextual("as")) {
      node.local = this.parseIdent();
    } else {
      this.checkUnreserved(node.imported);
      node.local = node.imported;
    }
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportSpecifier");
  };
  pp$8.parseImportDefaultSpecifier = function() {
    var node = this.startNode();
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportDefaultSpecifier");
  };
  pp$8.parseImportNamespaceSpecifier = function() {
    var node = this.startNode();
    this.next();
    this.expectContextual("as");
    node.local = this.parseIdent();
    this.checkLValSimple(node.local, BIND_LEXICAL);
    return this.finishNode(node, "ImportNamespaceSpecifier");
  };
  pp$8.parseImportSpecifiers = function() {
    var nodes = [], first = true;
    if (this.type === types$1.name) {
      nodes.push(this.parseImportDefaultSpecifier());
      if (!this.eat(types$1.comma)) {
        return nodes;
      }
    }
    if (this.type === types$1.star) {
      nodes.push(this.parseImportNamespaceSpecifier());
      return nodes;
    }
    this.expect(types$1.braceL);
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      nodes.push(this.parseImportSpecifier());
    }
    return nodes;
  };
  pp$8.parseWithClause = function() {
    var nodes = [];
    if (!this.eat(types$1._with)) {
      return nodes;
    }
    this.expect(types$1.braceL);
    var attributeKeys = {};
    var first = true;
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      var attr = this.parseImportAttribute();
      var keyName = attr.key.type === "Identifier" ? attr.key.name : attr.key.value;
      if (hasOwn(attributeKeys, keyName)) {
        this.raiseRecoverable(attr.key.start, "Duplicate attribute key '" + keyName + "'");
      }
      attributeKeys[keyName] = true;
      nodes.push(attr);
    }
    return nodes;
  };
  pp$8.parseImportAttribute = function() {
    var node = this.startNode();
    node.key = this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
    this.expect(types$1.colon);
    if (this.type !== types$1.string) {
      this.unexpected();
    }
    node.value = this.parseExprAtom();
    return this.finishNode(node, "ImportAttribute");
  };
  pp$8.parseModuleExportName = function() {
    if (this.options.ecmaVersion >= 13 && this.type === types$1.string) {
      var stringLiteral = this.parseLiteral(this.value);
      if (loneSurrogate.test(stringLiteral.value)) {
        this.raise(stringLiteral.start, "An export name cannot include a lone surrogate.");
      }
      return stringLiteral;
    }
    return this.parseIdent(true);
  };
  pp$8.adaptDirectivePrologue = function(statements) {
    for (var i2 = 0; i2 < statements.length && this.isDirectiveCandidate(statements[i2]); ++i2) {
      statements[i2].directive = statements[i2].expression.raw.slice(1, -1);
    }
  };
  pp$8.isDirectiveCandidate = function(statement) {
    return this.options.ecmaVersion >= 5 && statement.type === "ExpressionStatement" && statement.expression.type === "Literal" && typeof statement.expression.value === "string" && // Reject parenthesized strings.
    (this.input[statement.start] === '"' || this.input[statement.start] === "'");
  };
  var pp$7 = Parser.prototype;
  pp$7.toAssignable = function(node, isBinding, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 6 && node) {
      switch (node.type) {
        case "Identifier":
          if (this.inAsync && node.name === "await") {
            this.raise(node.start, "Cannot use 'await' as identifier inside an async function");
          }
          break;
        case "ObjectPattern":
        case "ArrayPattern":
        case "AssignmentPattern":
        case "RestElement":
          break;
        case "ObjectExpression":
          node.type = "ObjectPattern";
          if (refDestructuringErrors) {
            this.checkPatternErrors(refDestructuringErrors, true);
          }
          for (var i2 = 0, list2 = node.properties; i2 < list2.length; i2 += 1) {
            var prop = list2[i2];
            this.toAssignable(prop, isBinding);
            if (prop.type === "RestElement" && (prop.argument.type === "ArrayPattern" || prop.argument.type === "ObjectPattern")) {
              this.raise(prop.argument.start, "Unexpected token");
            }
          }
          break;
        case "Property":
          if (node.kind !== "init") {
            this.raise(node.key.start, "Object pattern can't contain getter or setter");
          }
          this.toAssignable(node.value, isBinding);
          break;
        case "ArrayExpression":
          node.type = "ArrayPattern";
          if (refDestructuringErrors) {
            this.checkPatternErrors(refDestructuringErrors, true);
          }
          this.toAssignableList(node.elements, isBinding);
          break;
        case "SpreadElement":
          node.type = "RestElement";
          this.toAssignable(node.argument, isBinding);
          if (node.argument.type === "AssignmentPattern") {
            this.raise(node.argument.start, "Rest elements cannot have a default value");
          }
          break;
        case "AssignmentExpression":
          if (node.operator !== "=") {
            this.raise(node.left.end, "Only '=' operator can be used for specifying default value.");
          }
          node.type = "AssignmentPattern";
          delete node.operator;
          this.toAssignable(node.left, isBinding);
          break;
        case "ParenthesizedExpression":
          this.toAssignable(node.expression, isBinding, refDestructuringErrors);
          break;
        case "ChainExpression":
          this.raiseRecoverable(node.start, "Optional chaining cannot appear in left-hand side");
          break;
        case "MemberExpression":
          if (!isBinding) {
            break;
          }
        default:
          this.raise(node.start, "Assigning to rvalue");
      }
    } else if (refDestructuringErrors) {
      this.checkPatternErrors(refDestructuringErrors, true);
    }
    return node;
  };
  pp$7.toAssignableList = function(exprList, isBinding) {
    var end = exprList.length;
    for (var i2 = 0; i2 < end; i2++) {
      var elt = exprList[i2];
      if (elt) {
        this.toAssignable(elt, isBinding);
      }
    }
    if (end) {
      var last = exprList[end - 1];
      if (this.options.ecmaVersion === 6 && isBinding && last && last.type === "RestElement" && last.argument.type !== "Identifier") {
        this.unexpected(last.argument.start);
      }
    }
    return exprList;
  };
  pp$7.parseSpread = function(refDestructuringErrors) {
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeAssign(false, refDestructuringErrors);
    return this.finishNode(node, "SpreadElement");
  };
  pp$7.parseRestBinding = function() {
    var node = this.startNode();
    this.next();
    if (this.options.ecmaVersion === 6 && this.type !== types$1.name) {
      this.unexpected();
    }
    node.argument = this.parseBindingAtom();
    return this.finishNode(node, "RestElement");
  };
  pp$7.parseBindingAtom = function() {
    if (this.options.ecmaVersion >= 6) {
      switch (this.type) {
        case types$1.bracketL:
          var node = this.startNode();
          this.next();
          node.elements = this.parseBindingList(types$1.bracketR, true, true);
          return this.finishNode(node, "ArrayPattern");
        case types$1.braceL:
          return this.parseObj(true);
      }
    }
    return this.parseIdent();
  };
  pp$7.parseBindingList = function(close, allowEmpty, allowTrailingComma, allowModifiers) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (first) {
        first = false;
      } else {
        this.expect(types$1.comma);
      }
      if (allowEmpty && this.type === types$1.comma) {
        elts.push(null);
      } else if (allowTrailingComma && this.afterTrailingComma(close)) {
        break;
      } else if (this.type === types$1.ellipsis) {
        var rest = this.parseRestBinding();
        this.parseBindingListItem(rest);
        elts.push(rest);
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        this.expect(close);
        break;
      } else {
        elts.push(this.parseAssignableListItem(allowModifiers));
      }
    }
    return elts;
  };
  pp$7.parseAssignableListItem = function(allowModifiers) {
    var elem = this.parseMaybeDefault(this.start, this.startLoc);
    this.parseBindingListItem(elem);
    return elem;
  };
  pp$7.parseBindingListItem = function(param) {
    return param;
  };
  pp$7.parseMaybeDefault = function(startPos, startLoc, left) {
    left = left || this.parseBindingAtom();
    if (this.options.ecmaVersion < 6 || !this.eat(types$1.eq)) {
      return left;
    }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.right = this.parseMaybeAssign();
    return this.finishNode(node, "AssignmentPattern");
  };
  pp$7.checkLValSimple = function(expr, bindingType, checkClashes) {
    if (bindingType === void 0) bindingType = BIND_NONE;
    var isBind = bindingType !== BIND_NONE;
    switch (expr.type) {
      case "Identifier":
        if (this.strict && this.reservedWordsStrictBind.test(expr.name)) {
          this.raiseRecoverable(expr.start, (isBind ? "Binding " : "Assigning to ") + expr.name + " in strict mode");
        }
        if (isBind) {
          if (bindingType === BIND_LEXICAL && expr.name === "let") {
            this.raiseRecoverable(expr.start, "let is disallowed as a lexically bound name");
          }
          if (checkClashes) {
            if (hasOwn(checkClashes, expr.name)) {
              this.raiseRecoverable(expr.start, "Argument name clash");
            }
            checkClashes[expr.name] = true;
          }
          if (bindingType !== BIND_OUTSIDE) {
            this.declareName(expr.name, bindingType, expr.start);
          }
        }
        break;
      case "ChainExpression":
        this.raiseRecoverable(expr.start, "Optional chaining cannot appear in left-hand side");
        break;
      case "MemberExpression":
        if (isBind) {
          this.raiseRecoverable(expr.start, "Binding member expression");
        }
        break;
      case "ParenthesizedExpression":
        if (isBind) {
          this.raiseRecoverable(expr.start, "Binding parenthesized expression");
        }
        return this.checkLValSimple(expr.expression, bindingType, checkClashes);
      default:
        this.raise(expr.start, (isBind ? "Binding" : "Assigning to") + " rvalue");
    }
  };
  pp$7.checkLValPattern = function(expr, bindingType, checkClashes) {
    if (bindingType === void 0) bindingType = BIND_NONE;
    switch (expr.type) {
      case "ObjectPattern":
        for (var i2 = 0, list2 = expr.properties; i2 < list2.length; i2 += 1) {
          var prop = list2[i2];
          this.checkLValInnerPattern(prop, bindingType, checkClashes);
        }
        break;
      case "ArrayPattern":
        for (var i$1 = 0, list$1 = expr.elements; i$1 < list$1.length; i$1 += 1) {
          var elem = list$1[i$1];
          if (elem) {
            this.checkLValInnerPattern(elem, bindingType, checkClashes);
          }
        }
        break;
      default:
        this.checkLValSimple(expr, bindingType, checkClashes);
    }
  };
  pp$7.checkLValInnerPattern = function(expr, bindingType, checkClashes) {
    if (bindingType === void 0) bindingType = BIND_NONE;
    switch (expr.type) {
      case "Property":
        this.checkLValInnerPattern(expr.value, bindingType, checkClashes);
        break;
      case "AssignmentPattern":
        this.checkLValPattern(expr.left, bindingType, checkClashes);
        break;
      case "RestElement":
        this.checkLValPattern(expr.argument, bindingType, checkClashes);
        break;
      default:
        this.checkLValPattern(expr, bindingType, checkClashes);
    }
  };
  var TokContext = function TokContext2(token, isExpr, preserveSpace, override, generator) {
    this.token = token;
    this.isExpr = !!isExpr;
    this.preserveSpace = !!preserveSpace;
    this.override = override;
    this.generator = !!generator;
  };
  var types = {
    b_stat: new TokContext("{", false),
    b_expr: new TokContext("{", true),
    b_tmpl: new TokContext("${", false),
    p_stat: new TokContext("(", false),
    p_expr: new TokContext("(", true),
    q_tmpl: new TokContext("`", true, true, function(p) {
      return p.tryReadTemplateToken();
    }),
    f_stat: new TokContext("function", false),
    f_expr: new TokContext("function", true),
    f_expr_gen: new TokContext("function", true, false, null, true),
    f_gen: new TokContext("function", false, false, null, true)
  };
  var pp$6 = Parser.prototype;
  pp$6.initialContext = function() {
    return [types.b_stat];
  };
  pp$6.curContext = function() {
    return this.context[this.context.length - 1];
  };
  pp$6.braceIsBlock = function(prevType) {
    var parent = this.curContext();
    if (parent === types.f_expr || parent === types.f_stat) {
      return true;
    }
    if (prevType === types$1.colon && (parent === types.b_stat || parent === types.b_expr)) {
      return !parent.isExpr;
    }
    if (prevType === types$1._return || prevType === types$1.name && this.exprAllowed) {
      return lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
    }
    if (prevType === types$1._else || prevType === types$1.semi || prevType === types$1.eof || prevType === types$1.parenR || prevType === types$1.arrow) {
      return true;
    }
    if (prevType === types$1.braceL) {
      return parent === types.b_stat;
    }
    if (prevType === types$1._var || prevType === types$1._const || prevType === types$1.name) {
      return false;
    }
    return !this.exprAllowed;
  };
  pp$6.inGeneratorContext = function() {
    for (var i2 = this.context.length - 1; i2 >= 1; i2--) {
      var context = this.context[i2];
      if (context.token === "function") {
        return context.generator;
      }
    }
    return false;
  };
  pp$6.updateContext = function(prevType) {
    var update, type = this.type;
    if (type.keyword && prevType === types$1.dot) {
      this.exprAllowed = false;
    } else if (update = type.updateContext) {
      update.call(this, prevType);
    } else {
      this.exprAllowed = type.beforeExpr;
    }
  };
  pp$6.overrideContext = function(tokenCtx) {
    if (this.curContext() !== tokenCtx) {
      this.context[this.context.length - 1] = tokenCtx;
    }
  };
  types$1.parenR.updateContext = types$1.braceR.updateContext = function() {
    if (this.context.length === 1) {
      this.exprAllowed = true;
      return;
    }
    var out = this.context.pop();
    if (out === types.b_stat && this.curContext().token === "function") {
      out = this.context.pop();
    }
    this.exprAllowed = !out.isExpr;
  };
  types$1.braceL.updateContext = function(prevType) {
    this.context.push(this.braceIsBlock(prevType) ? types.b_stat : types.b_expr);
    this.exprAllowed = true;
  };
  types$1.dollarBraceL.updateContext = function() {
    this.context.push(types.b_tmpl);
    this.exprAllowed = true;
  };
  types$1.parenL.updateContext = function(prevType) {
    var statementParens = prevType === types$1._if || prevType === types$1._for || prevType === types$1._with || prevType === types$1._while;
    this.context.push(statementParens ? types.p_stat : types.p_expr);
    this.exprAllowed = true;
  };
  types$1.incDec.updateContext = function() {
  };
  types$1._function.updateContext = types$1._class.updateContext = function(prevType) {
    if (prevType.beforeExpr && prevType !== types$1._else && !(prevType === types$1.semi && this.curContext() !== types.p_stat) && !(prevType === types$1._return && lineBreak.test(this.input.slice(this.lastTokEnd, this.start))) && !((prevType === types$1.colon || prevType === types$1.braceL) && this.curContext() === types.b_stat)) {
      this.context.push(types.f_expr);
    } else {
      this.context.push(types.f_stat);
    }
    this.exprAllowed = false;
  };
  types$1.colon.updateContext = function() {
    if (this.curContext().token === "function") {
      this.context.pop();
    }
    this.exprAllowed = true;
  };
  types$1.backQuote.updateContext = function() {
    if (this.curContext() === types.q_tmpl) {
      this.context.pop();
    } else {
      this.context.push(types.q_tmpl);
    }
    this.exprAllowed = false;
  };
  types$1.star.updateContext = function(prevType) {
    if (prevType === types$1._function) {
      var index = this.context.length - 1;
      if (this.context[index] === types.f_expr) {
        this.context[index] = types.f_expr_gen;
      } else {
        this.context[index] = types.f_gen;
      }
    }
    this.exprAllowed = true;
  };
  types$1.name.updateContext = function(prevType) {
    var allowed = false;
    if (this.options.ecmaVersion >= 6 && prevType !== types$1.dot) {
      if (this.value === "of" && !this.exprAllowed || this.value === "yield" && this.inGeneratorContext()) {
        allowed = true;
      }
    }
    this.exprAllowed = allowed;
  };
  var pp$5 = Parser.prototype;
  pp$5.checkPropClash = function(prop, propHash, refDestructuringErrors) {
    if (this.options.ecmaVersion >= 9 && prop.type === "SpreadElement") {
      return;
    }
    if (this.options.ecmaVersion >= 6 && (prop.computed || prop.method || prop.shorthand)) {
      return;
    }
    var key = prop.key;
    var name;
    switch (key.type) {
      case "Identifier":
        name = key.name;
        break;
      case "Literal":
        name = String(key.value);
        break;
      default:
        return;
    }
    var kind = prop.kind;
    if (this.options.ecmaVersion >= 6) {
      if (name === "__proto__" && kind === "init") {
        if (propHash.proto) {
          if (refDestructuringErrors) {
            if (refDestructuringErrors.doubleProto < 0) {
              refDestructuringErrors.doubleProto = key.start;
            }
          } else {
            this.raiseRecoverable(key.start, "Redefinition of __proto__ property");
          }
        }
        propHash.proto = true;
      }
      return;
    }
    name = "$" + name;
    var other = propHash[name];
    if (other) {
      var redefinition;
      if (kind === "init") {
        redefinition = this.strict && other.init || other.get || other.set;
      } else {
        redefinition = other.init || other[kind];
      }
      if (redefinition) {
        this.raiseRecoverable(key.start, "Redefinition of property");
      }
    } else {
      other = propHash[name] = {
        init: false,
        get: false,
        set: false
      };
    }
    other[kind] = true;
  };
  pp$5.parseExpression = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeAssign(forInit, refDestructuringErrors);
    if (this.type === types$1.comma) {
      var node = this.startNodeAt(startPos, startLoc);
      node.expressions = [expr];
      while (this.eat(types$1.comma)) {
        node.expressions.push(this.parseMaybeAssign(forInit, refDestructuringErrors));
      }
      return this.finishNode(node, "SequenceExpression");
    }
    return expr;
  };
  pp$5.parseMaybeAssign = function(forInit, refDestructuringErrors, afterLeftParse) {
    if (this.isContextual("yield")) {
      if (this.inGenerator) {
        return this.parseYield(forInit);
      } else {
        this.exprAllowed = false;
      }
    }
    var ownDestructuringErrors = false, oldParenAssign = -1, oldTrailingComma = -1, oldDoubleProto = -1;
    if (refDestructuringErrors) {
      oldParenAssign = refDestructuringErrors.parenthesizedAssign;
      oldTrailingComma = refDestructuringErrors.trailingComma;
      oldDoubleProto = refDestructuringErrors.doubleProto;
      refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = -1;
    } else {
      refDestructuringErrors = new DestructuringErrors();
      ownDestructuringErrors = true;
    }
    var startPos = this.start, startLoc = this.startLoc;
    if (this.type === types$1.parenL || this.type === types$1.name) {
      this.potentialArrowAt = this.start;
      this.potentialArrowInForAwait = forInit === "await";
    }
    var left = this.parseMaybeConditional(forInit, refDestructuringErrors);
    if (afterLeftParse) {
      left = afterLeftParse.call(this, left, startPos, startLoc);
    }
    if (this.type.isAssign) {
      var node = this.startNodeAt(startPos, startLoc);
      node.operator = this.value;
      if (this.type === types$1.eq) {
        left = this.toAssignable(left, false, refDestructuringErrors);
      }
      if (!ownDestructuringErrors) {
        refDestructuringErrors.parenthesizedAssign = refDestructuringErrors.trailingComma = refDestructuringErrors.doubleProto = -1;
      }
      if (refDestructuringErrors.shorthandAssign >= left.start) {
        refDestructuringErrors.shorthandAssign = -1;
      }
      if (this.type === types$1.eq) {
        this.checkLValPattern(left);
      } else {
        this.checkLValSimple(left);
      }
      node.left = left;
      this.next();
      node.right = this.parseMaybeAssign(forInit);
      if (oldDoubleProto > -1) {
        refDestructuringErrors.doubleProto = oldDoubleProto;
      }
      return this.finishNode(node, "AssignmentExpression");
    } else {
      if (ownDestructuringErrors) {
        this.checkExpressionErrors(refDestructuringErrors, true);
      }
    }
    if (oldParenAssign > -1) {
      refDestructuringErrors.parenthesizedAssign = oldParenAssign;
    }
    if (oldTrailingComma > -1) {
      refDestructuringErrors.trailingComma = oldTrailingComma;
    }
    return left;
  };
  pp$5.parseMaybeConditional = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprOps(forInit, refDestructuringErrors);
    if (this.checkExpressionErrors(refDestructuringErrors)) {
      return expr;
    }
    if (this.eat(types$1.question)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.test = expr;
      node.consequent = this.parseMaybeAssign();
      this.expect(types$1.colon);
      node.alternate = this.parseMaybeAssign(forInit);
      return this.finishNode(node, "ConditionalExpression");
    }
    return expr;
  };
  pp$5.parseExprOps = function(forInit, refDestructuringErrors) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseMaybeUnary(refDestructuringErrors, false, false, forInit);
    if (this.checkExpressionErrors(refDestructuringErrors)) {
      return expr;
    }
    return expr.start === startPos && expr.type === "ArrowFunctionExpression" ? expr : this.parseExprOp(expr, startPos, startLoc, -1, forInit);
  };
  pp$5.parseExprOp = function(left, leftStartPos, leftStartLoc, minPrec, forInit) {
    var prec = this.type.binop;
    if (prec != null && (!forInit || this.type !== types$1._in)) {
      if (prec > minPrec) {
        var logical = this.type === types$1.logicalOR || this.type === types$1.logicalAND;
        var coalesce = this.type === types$1.coalesce;
        if (coalesce) {
          prec = types$1.logicalAND.binop;
        }
        var op = this.value;
        this.next();
        var startPos = this.start, startLoc = this.startLoc;
        var right = this.parseExprOp(this.parseMaybeUnary(null, false, false, forInit), startPos, startLoc, prec, forInit);
        var node = this.buildBinary(leftStartPos, leftStartLoc, left, right, op, logical || coalesce);
        if (logical && this.type === types$1.coalesce || coalesce && (this.type === types$1.logicalOR || this.type === types$1.logicalAND)) {
          this.raiseRecoverable(this.start, "Logical expressions and coalesce expressions cannot be mixed. Wrap either by parentheses");
        }
        return this.parseExprOp(node, leftStartPos, leftStartLoc, minPrec, forInit);
      }
    }
    return left;
  };
  pp$5.buildBinary = function(startPos, startLoc, left, right, op, logical) {
    if (right.type === "PrivateIdentifier") {
      this.raise(right.start, "Private identifier can only be left side of binary expression");
    }
    var node = this.startNodeAt(startPos, startLoc);
    node.left = left;
    node.operator = op;
    node.right = right;
    return this.finishNode(node, logical ? "LogicalExpression" : "BinaryExpression");
  };
  pp$5.parseMaybeUnary = function(refDestructuringErrors, sawUnary, incDec, forInit) {
    var startPos = this.start, startLoc = this.startLoc, expr;
    if (this.isContextual("await") && this.canAwait) {
      expr = this.parseAwait(forInit);
      sawUnary = true;
    } else if (this.type.prefix) {
      var node = this.startNode(), update = this.type === types$1.incDec;
      node.operator = this.value;
      node.prefix = true;
      this.next();
      node.argument = this.parseMaybeUnary(null, true, update, forInit);
      this.checkExpressionErrors(refDestructuringErrors, true);
      if (update) {
        this.checkLValSimple(node.argument);
      } else if (this.strict && node.operator === "delete" && isLocalVariableAccess(node.argument)) {
        this.raiseRecoverable(node.start, "Deleting local variable in strict mode");
      } else if (node.operator === "delete" && isPrivateFieldAccess(node.argument)) {
        this.raiseRecoverable(node.start, "Private fields can not be deleted");
      } else {
        sawUnary = true;
      }
      expr = this.finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    } else if (!sawUnary && this.type === types$1.privateId) {
      if ((forInit || this.privateNameStack.length === 0) && this.options.checkPrivateFields) {
        this.unexpected();
      }
      expr = this.parsePrivateIdent();
      if (this.type !== types$1._in) {
        this.unexpected();
      }
    } else {
      expr = this.parseExprSubscripts(refDestructuringErrors, forInit);
      if (this.checkExpressionErrors(refDestructuringErrors)) {
        return expr;
      }
      while (this.type.postfix && !this.canInsertSemicolon()) {
        var node$1 = this.startNodeAt(startPos, startLoc);
        node$1.operator = this.value;
        node$1.prefix = false;
        node$1.argument = expr;
        this.checkLValSimple(expr);
        this.next();
        expr = this.finishNode(node$1, "UpdateExpression");
      }
    }
    if (!incDec && this.eat(types$1.starstar)) {
      if (sawUnary) {
        this.unexpected(this.lastTokStart);
      } else {
        return this.buildBinary(startPos, startLoc, expr, this.parseMaybeUnary(null, false, false, forInit), "**", false);
      }
    } else {
      return expr;
    }
  };
  function isLocalVariableAccess(node) {
    return node.type === "Identifier" || node.type === "ParenthesizedExpression" && isLocalVariableAccess(node.expression);
  }
  function isPrivateFieldAccess(node) {
    return node.type === "MemberExpression" && node.property.type === "PrivateIdentifier" || node.type === "ChainExpression" && isPrivateFieldAccess(node.expression) || node.type === "ParenthesizedExpression" && isPrivateFieldAccess(node.expression);
  }
  pp$5.parseExprSubscripts = function(refDestructuringErrors, forInit) {
    var startPos = this.start, startLoc = this.startLoc;
    var expr = this.parseExprAtom(refDestructuringErrors, forInit);
    if (expr.type === "ArrowFunctionExpression" && this.input.slice(this.lastTokStart, this.lastTokEnd) !== ")") {
      return expr;
    }
    var result = this.parseSubscripts(expr, startPos, startLoc, false, forInit);
    if (refDestructuringErrors && result.type === "MemberExpression") {
      if (refDestructuringErrors.parenthesizedAssign >= result.start) {
        refDestructuringErrors.parenthesizedAssign = -1;
      }
      if (refDestructuringErrors.parenthesizedBind >= result.start) {
        refDestructuringErrors.parenthesizedBind = -1;
      }
      if (refDestructuringErrors.trailingComma >= result.start) {
        refDestructuringErrors.trailingComma = -1;
      }
    }
    return result;
  };
  pp$5.parseSubscripts = function(base, startPos, startLoc, noCalls, forInit) {
    var maybeAsyncArrow = this.options.ecmaVersion >= 8 && base.type === "Identifier" && base.name === "async" && this.lastTokEnd === base.end && !this.canInsertSemicolon() && base.end - base.start === 5 && this.potentialArrowAt === base.start;
    var optionalChained = false;
    while (true) {
      var element = this.parseSubscript(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit);
      if (element.optional) {
        optionalChained = true;
      }
      if (element === base || element.type === "ArrowFunctionExpression") {
        if (optionalChained) {
          var chainNode = this.startNodeAt(startPos, startLoc);
          chainNode.expression = element;
          element = this.finishNode(chainNode, "ChainExpression");
        }
        return element;
      }
      base = element;
    }
  };
  pp$5.shouldParseAsyncArrow = function() {
    return !this.canInsertSemicolon() && this.eat(types$1.arrow);
  };
  pp$5.parseSubscriptAsyncArrow = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, true, forInit);
  };
  pp$5.parseSubscript = function(base, startPos, startLoc, noCalls, maybeAsyncArrow, optionalChained, forInit) {
    var optionalSupported = this.options.ecmaVersion >= 11;
    var optional = optionalSupported && this.eat(types$1.questionDot);
    if (noCalls && optional) {
      this.raise(this.lastTokStart, "Optional chaining cannot appear in the callee of new expressions");
    }
    var computed = this.eat(types$1.bracketL);
    if (computed || optional && this.type !== types$1.parenL && this.type !== types$1.backQuote || this.eat(types$1.dot)) {
      var node = this.startNodeAt(startPos, startLoc);
      node.object = base;
      if (computed) {
        node.property = this.parseExpression();
        this.expect(types$1.bracketR);
      } else if (this.type === types$1.privateId && base.type !== "Super") {
        node.property = this.parsePrivateIdent();
      } else {
        node.property = this.parseIdent(this.options.allowReserved !== "never");
      }
      node.computed = !!computed;
      if (optionalSupported) {
        node.optional = optional;
      }
      base = this.finishNode(node, "MemberExpression");
    } else if (!noCalls && this.eat(types$1.parenL)) {
      var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
      this.yieldPos = 0;
      this.awaitPos = 0;
      this.awaitIdentPos = 0;
      var exprList = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false, refDestructuringErrors);
      if (maybeAsyncArrow && !optional && this.shouldParseAsyncArrow()) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        if (this.awaitIdentPos > 0) {
          this.raise(this.awaitIdentPos, "Cannot use 'await' as identifier inside an async function");
        }
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        this.awaitIdentPos = oldAwaitIdentPos;
        return this.parseSubscriptAsyncArrow(startPos, startLoc, exprList, forInit);
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      this.awaitIdentPos = oldAwaitIdentPos || this.awaitIdentPos;
      var node$1 = this.startNodeAt(startPos, startLoc);
      node$1.callee = base;
      node$1.arguments = exprList;
      if (optionalSupported) {
        node$1.optional = optional;
      }
      base = this.finishNode(node$1, "CallExpression");
    } else if (this.type === types$1.backQuote) {
      if (optional || optionalChained) {
        this.raise(this.start, "Optional chaining cannot appear in the tag of tagged template expressions");
      }
      var node$2 = this.startNodeAt(startPos, startLoc);
      node$2.tag = base;
      node$2.quasi = this.parseTemplate({ isTagged: true });
      base = this.finishNode(node$2, "TaggedTemplateExpression");
    }
    return base;
  };
  pp$5.parseExprAtom = function(refDestructuringErrors, forInit, forNew) {
    if (this.type === types$1.slash) {
      this.readRegexp();
    }
    var node, canBeArrow = this.potentialArrowAt === this.start;
    switch (this.type) {
      case types$1._super:
        if (!this.allowSuper) {
          this.raise(this.start, "'super' keyword outside a method");
        }
        node = this.startNode();
        this.next();
        if (this.type === types$1.parenL && !this.allowDirectSuper) {
          this.raise(node.start, "super() call outside constructor of a subclass");
        }
        if (this.type !== types$1.dot && this.type !== types$1.bracketL && this.type !== types$1.parenL) {
          this.unexpected();
        }
        return this.finishNode(node, "Super");
      case types$1._this:
        node = this.startNode();
        this.next();
        return this.finishNode(node, "ThisExpression");
      case types$1.name:
        var startPos = this.start, startLoc = this.startLoc, containsEsc = this.containsEsc;
        var id = this.parseIdent(false);
        if (this.options.ecmaVersion >= 8 && !containsEsc && id.name === "async" && !this.canInsertSemicolon() && this.eat(types$1._function)) {
          this.overrideContext(types.f_expr);
          return this.parseFunction(this.startNodeAt(startPos, startLoc), 0, false, true, forInit);
        }
        if (canBeArrow && !this.canInsertSemicolon()) {
          if (this.eat(types$1.arrow)) {
            return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], false, forInit);
          }
          if (this.options.ecmaVersion >= 8 && id.name === "async" && this.type === types$1.name && !containsEsc && (!this.potentialArrowInForAwait || this.value !== "of" || this.containsEsc)) {
            id = this.parseIdent(false);
            if (this.canInsertSemicolon() || !this.eat(types$1.arrow)) {
              this.unexpected();
            }
            return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), [id], true, forInit);
          }
        }
        return id;
      case types$1.regexp:
        var value = this.value;
        node = this.parseLiteral(value.value);
        node.regex = { pattern: value.pattern, flags: value.flags };
        return node;
      case types$1.num:
      case types$1.string:
        return this.parseLiteral(this.value);
      case types$1._null:
      case types$1._true:
      case types$1._false:
        node = this.startNode();
        node.value = this.type === types$1._null ? null : this.type === types$1._true;
        node.raw = this.type.keyword;
        this.next();
        return this.finishNode(node, "Literal");
      case types$1.parenL:
        var start = this.start, expr = this.parseParenAndDistinguishExpression(canBeArrow, forInit);
        if (refDestructuringErrors) {
          if (refDestructuringErrors.parenthesizedAssign < 0 && !this.isSimpleAssignTarget(expr)) {
            refDestructuringErrors.parenthesizedAssign = start;
          }
          if (refDestructuringErrors.parenthesizedBind < 0) {
            refDestructuringErrors.parenthesizedBind = start;
          }
        }
        return expr;
      case types$1.bracketL:
        node = this.startNode();
        this.next();
        node.elements = this.parseExprList(types$1.bracketR, true, true, refDestructuringErrors);
        return this.finishNode(node, "ArrayExpression");
      case types$1.braceL:
        this.overrideContext(types.b_expr);
        return this.parseObj(false, refDestructuringErrors);
      case types$1._function:
        node = this.startNode();
        this.next();
        return this.parseFunction(node, 0);
      case types$1._class:
        return this.parseClass(this.startNode(), false);
      case types$1._new:
        return this.parseNew();
      case types$1.backQuote:
        return this.parseTemplate();
      case types$1._import:
        if (this.options.ecmaVersion >= 11) {
          return this.parseExprImport(forNew);
        } else {
          return this.unexpected();
        }
      default:
        return this.parseExprAtomDefault();
    }
  };
  pp$5.parseExprAtomDefault = function() {
    this.unexpected();
  };
  pp$5.parseExprImport = function(forNew) {
    var node = this.startNode();
    if (this.containsEsc) {
      this.raiseRecoverable(this.start, "Escape sequence in keyword import");
    }
    this.next();
    if (this.type === types$1.parenL && !forNew) {
      return this.parseDynamicImport(node);
    } else if (this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "import";
      node.meta = this.finishNode(meta, "Identifier");
      return this.parseImportMeta(node);
    } else {
      this.unexpected();
    }
  };
  pp$5.parseDynamicImport = function(node) {
    this.next();
    node.source = this.parseMaybeAssign();
    if (this.options.ecmaVersion >= 16) {
      if (!this.eat(types$1.parenR)) {
        this.expect(types$1.comma);
        if (!this.afterTrailingComma(types$1.parenR)) {
          node.options = this.parseMaybeAssign();
          if (!this.eat(types$1.parenR)) {
            this.expect(types$1.comma);
            if (!this.afterTrailingComma(types$1.parenR)) {
              this.unexpected();
            }
          }
        } else {
          node.options = null;
        }
      } else {
        node.options = null;
      }
    } else {
      if (!this.eat(types$1.parenR)) {
        var errorPos = this.start;
        if (this.eat(types$1.comma) && this.eat(types$1.parenR)) {
          this.raiseRecoverable(errorPos, "Trailing comma is not allowed in import()");
        } else {
          this.unexpected(errorPos);
        }
      }
    }
    return this.finishNode(node, "ImportExpression");
  };
  pp$5.parseImportMeta = function(node) {
    this.next();
    var containsEsc = this.containsEsc;
    node.property = this.parseIdent(true);
    if (node.property.name !== "meta") {
      this.raiseRecoverable(node.property.start, "The only valid meta property for import is 'import.meta'");
    }
    if (containsEsc) {
      this.raiseRecoverable(node.start, "'import.meta' must not contain escaped characters");
    }
    if (this.options.sourceType !== "module" && !this.options.allowImportExportEverywhere) {
      this.raiseRecoverable(node.start, "Cannot use 'import.meta' outside a module");
    }
    return this.finishNode(node, "MetaProperty");
  };
  pp$5.parseLiteral = function(value) {
    var node = this.startNode();
    node.value = value;
    node.raw = this.input.slice(this.start, this.end);
    if (node.raw.charCodeAt(node.raw.length - 1) === 110) {
      node.bigint = node.value != null ? node.value.toString() : node.raw.slice(0, -1).replace(/_/g, "");
    }
    this.next();
    return this.finishNode(node, "Literal");
  };
  pp$5.parseParenExpression = function() {
    this.expect(types$1.parenL);
    var val = this.parseExpression();
    this.expect(types$1.parenR);
    return val;
  };
  pp$5.shouldParseArrow = function(exprList) {
    return !this.canInsertSemicolon();
  };
  pp$5.parseParenAndDistinguishExpression = function(canBeArrow, forInit) {
    var startPos = this.start, startLoc = this.startLoc, val, allowTrailingComma = this.options.ecmaVersion >= 8;
    if (this.options.ecmaVersion >= 6) {
      this.next();
      var innerStartPos = this.start, innerStartLoc = this.startLoc;
      var exprList = [], first = true, lastIsComma = false;
      var refDestructuringErrors = new DestructuringErrors(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, spreadStart;
      this.yieldPos = 0;
      this.awaitPos = 0;
      while (this.type !== types$1.parenR) {
        first ? first = false : this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(types$1.parenR, true)) {
          lastIsComma = true;
          break;
        } else if (this.type === types$1.ellipsis) {
          spreadStart = this.start;
          exprList.push(this.parseParenItem(this.parseRestBinding()));
          if (this.type === types$1.comma) {
            this.raiseRecoverable(
              this.start,
              "Comma is not permitted after the rest element"
            );
          }
          break;
        } else {
          exprList.push(this.parseMaybeAssign(false, refDestructuringErrors, this.parseParenItem));
        }
      }
      var innerEndPos = this.lastTokEnd, innerEndLoc = this.lastTokEndLoc;
      this.expect(types$1.parenR);
      if (canBeArrow && this.shouldParseArrow(exprList) && this.eat(types$1.arrow)) {
        this.checkPatternErrors(refDestructuringErrors, false);
        this.checkYieldAwaitInDefaultParams();
        this.yieldPos = oldYieldPos;
        this.awaitPos = oldAwaitPos;
        return this.parseParenArrowList(startPos, startLoc, exprList, forInit);
      }
      if (!exprList.length || lastIsComma) {
        this.unexpected(this.lastTokStart);
      }
      if (spreadStart) {
        this.unexpected(spreadStart);
      }
      this.checkExpressionErrors(refDestructuringErrors, true);
      this.yieldPos = oldYieldPos || this.yieldPos;
      this.awaitPos = oldAwaitPos || this.awaitPos;
      if (exprList.length > 1) {
        val = this.startNodeAt(innerStartPos, innerStartLoc);
        val.expressions = exprList;
        this.finishNodeAt(val, "SequenceExpression", innerEndPos, innerEndLoc);
      } else {
        val = exprList[0];
      }
    } else {
      val = this.parseParenExpression();
    }
    if (this.options.preserveParens) {
      var par = this.startNodeAt(startPos, startLoc);
      par.expression = val;
      return this.finishNode(par, "ParenthesizedExpression");
    } else {
      return val;
    }
  };
  pp$5.parseParenItem = function(item) {
    return item;
  };
  pp$5.parseParenArrowList = function(startPos, startLoc, exprList, forInit) {
    return this.parseArrowExpression(this.startNodeAt(startPos, startLoc), exprList, false, forInit);
  };
  var empty = [];
  pp$5.parseNew = function() {
    if (this.containsEsc) {
      this.raiseRecoverable(this.start, "Escape sequence in keyword new");
    }
    var node = this.startNode();
    this.next();
    if (this.options.ecmaVersion >= 6 && this.type === types$1.dot) {
      var meta = this.startNodeAt(node.start, node.loc && node.loc.start);
      meta.name = "new";
      node.meta = this.finishNode(meta, "Identifier");
      this.next();
      var containsEsc = this.containsEsc;
      node.property = this.parseIdent(true);
      if (node.property.name !== "target") {
        this.raiseRecoverable(node.property.start, "The only valid meta property for new is 'new.target'");
      }
      if (containsEsc) {
        this.raiseRecoverable(node.start, "'new.target' must not contain escaped characters");
      }
      if (!this.allowNewDotTarget) {
        this.raiseRecoverable(node.start, "'new.target' can only be used in functions and class static block");
      }
      return this.finishNode(node, "MetaProperty");
    }
    var startPos = this.start, startLoc = this.startLoc;
    node.callee = this.parseSubscripts(this.parseExprAtom(null, false, true), startPos, startLoc, true, false);
    if (this.eat(types$1.parenL)) {
      node.arguments = this.parseExprList(types$1.parenR, this.options.ecmaVersion >= 8, false);
    } else {
      node.arguments = empty;
    }
    return this.finishNode(node, "NewExpression");
  };
  pp$5.parseTemplateElement = function(ref2) {
    var isTagged = ref2.isTagged;
    var elem = this.startNode();
    if (this.type === types$1.invalidTemplate) {
      if (!isTagged) {
        this.raiseRecoverable(this.start, "Bad escape sequence in untagged template literal");
      }
      elem.value = {
        raw: this.value.replace(/\r\n?/g, "\n"),
        cooked: null
      };
    } else {
      elem.value = {
        raw: this.input.slice(this.start, this.end).replace(/\r\n?/g, "\n"),
        cooked: this.value
      };
    }
    this.next();
    elem.tail = this.type === types$1.backQuote;
    return this.finishNode(elem, "TemplateElement");
  };
  pp$5.parseTemplate = function(ref2) {
    if (ref2 === void 0) ref2 = {};
    var isTagged = ref2.isTagged;
    if (isTagged === void 0) isTagged = false;
    var node = this.startNode();
    this.next();
    node.expressions = [];
    var curElt = this.parseTemplateElement({ isTagged });
    node.quasis = [curElt];
    while (!curElt.tail) {
      if (this.type === types$1.eof) {
        this.raise(this.pos, "Unterminated template literal");
      }
      this.expect(types$1.dollarBraceL);
      node.expressions.push(this.parseExpression());
      this.expect(types$1.braceR);
      node.quasis.push(curElt = this.parseTemplateElement({ isTagged }));
    }
    this.next();
    return this.finishNode(node, "TemplateLiteral");
  };
  pp$5.isAsyncProp = function(prop) {
    return !prop.computed && prop.key.type === "Identifier" && prop.key.name === "async" && (this.type === types$1.name || this.type === types$1.num || this.type === types$1.string || this.type === types$1.bracketL || this.type.keyword || this.options.ecmaVersion >= 9 && this.type === types$1.star) && !lineBreak.test(this.input.slice(this.lastTokEnd, this.start));
  };
  pp$5.parseObj = function(isPattern, refDestructuringErrors) {
    var node = this.startNode(), first = true, propHash = {};
    node.properties = [];
    this.next();
    while (!this.eat(types$1.braceR)) {
      if (!first) {
        this.expect(types$1.comma);
        if (this.options.ecmaVersion >= 5 && this.afterTrailingComma(types$1.braceR)) {
          break;
        }
      } else {
        first = false;
      }
      var prop = this.parseProperty(isPattern, refDestructuringErrors);
      if (!isPattern) {
        this.checkPropClash(prop, propHash, refDestructuringErrors);
      }
      node.properties.push(prop);
    }
    return this.finishNode(node, isPattern ? "ObjectPattern" : "ObjectExpression");
  };
  pp$5.parseProperty = function(isPattern, refDestructuringErrors) {
    var prop = this.startNode(), isGenerator, isAsync, startPos, startLoc;
    if (this.options.ecmaVersion >= 9 && this.eat(types$1.ellipsis)) {
      if (isPattern) {
        prop.argument = this.parseIdent(false);
        if (this.type === types$1.comma) {
          this.raiseRecoverable(this.start, "Comma is not permitted after the rest element");
        }
        return this.finishNode(prop, "RestElement");
      }
      prop.argument = this.parseMaybeAssign(false, refDestructuringErrors);
      if (this.type === types$1.comma && refDestructuringErrors && refDestructuringErrors.trailingComma < 0) {
        refDestructuringErrors.trailingComma = this.start;
      }
      return this.finishNode(prop, "SpreadElement");
    }
    if (this.options.ecmaVersion >= 6) {
      prop.method = false;
      prop.shorthand = false;
      if (isPattern || refDestructuringErrors) {
        startPos = this.start;
        startLoc = this.startLoc;
      }
      if (!isPattern) {
        isGenerator = this.eat(types$1.star);
      }
    }
    var containsEsc = this.containsEsc;
    this.parsePropertyName(prop);
    if (!isPattern && !containsEsc && this.options.ecmaVersion >= 8 && !isGenerator && this.isAsyncProp(prop)) {
      isAsync = true;
      isGenerator = this.options.ecmaVersion >= 9 && this.eat(types$1.star);
      this.parsePropertyName(prop);
    } else {
      isAsync = false;
    }
    this.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
    return this.finishNode(prop, "Property");
  };
  pp$5.parseGetterSetter = function(prop) {
    var kind = prop.key.name;
    this.parsePropertyName(prop);
    prop.value = this.parseMethod(false);
    prop.kind = kind;
    var paramCount = prop.kind === "get" ? 0 : 1;
    if (prop.value.params.length !== paramCount) {
      var start = prop.value.start;
      if (prop.kind === "get") {
        this.raiseRecoverable(start, "getter should have no params");
      } else {
        this.raiseRecoverable(start, "setter should have exactly one param");
      }
    } else {
      if (prop.kind === "set" && prop.value.params[0].type === "RestElement") {
        this.raiseRecoverable(prop.value.params[0].start, "Setter cannot use rest params");
      }
    }
  };
  pp$5.parsePropertyValue = function(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc) {
    if ((isGenerator || isAsync) && this.type === types$1.colon) {
      this.unexpected();
    }
    if (this.eat(types$1.colon)) {
      prop.value = isPattern ? this.parseMaybeDefault(this.start, this.startLoc) : this.parseMaybeAssign(false, refDestructuringErrors);
      prop.kind = "init";
    } else if (this.options.ecmaVersion >= 6 && this.type === types$1.parenL) {
      if (isPattern) {
        this.unexpected();
      }
      prop.method = true;
      prop.value = this.parseMethod(isGenerator, isAsync);
      prop.kind = "init";
    } else if (!isPattern && !containsEsc && this.options.ecmaVersion >= 5 && !prop.computed && prop.key.type === "Identifier" && (prop.key.name === "get" || prop.key.name === "set") && (this.type !== types$1.comma && this.type !== types$1.braceR && this.type !== types$1.eq)) {
      if (isGenerator || isAsync) {
        this.unexpected();
      }
      this.parseGetterSetter(prop);
    } else if (this.options.ecmaVersion >= 6 && !prop.computed && prop.key.type === "Identifier") {
      if (isGenerator || isAsync) {
        this.unexpected();
      }
      this.checkUnreserved(prop.key);
      if (prop.key.name === "await" && !this.awaitIdentPos) {
        this.awaitIdentPos = startPos;
      }
      if (isPattern) {
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else if (this.type === types$1.eq && refDestructuringErrors) {
        if (refDestructuringErrors.shorthandAssign < 0) {
          refDestructuringErrors.shorthandAssign = this.start;
        }
        prop.value = this.parseMaybeDefault(startPos, startLoc, this.copyNode(prop.key));
      } else {
        prop.value = this.copyNode(prop.key);
      }
      prop.kind = "init";
      prop.shorthand = true;
    } else {
      this.unexpected();
    }
  };
  pp$5.parsePropertyName = function(prop) {
    if (this.options.ecmaVersion >= 6) {
      if (this.eat(types$1.bracketL)) {
        prop.computed = true;
        prop.key = this.parseMaybeAssign();
        this.expect(types$1.bracketR);
        return prop.key;
      } else {
        prop.computed = false;
      }
    }
    return prop.key = this.type === types$1.num || this.type === types$1.string ? this.parseExprAtom() : this.parseIdent(this.options.allowReserved !== "never");
  };
  pp$5.initFunction = function(node) {
    node.id = null;
    if (this.options.ecmaVersion >= 6) {
      node.generator = node.expression = false;
    }
    if (this.options.ecmaVersion >= 8) {
      node.async = false;
    }
  };
  pp$5.parseMethod = function(isGenerator, isAsync, allowDirectSuper) {
    var node = this.startNode(), oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.initFunction(node);
    if (this.options.ecmaVersion >= 6) {
      node.generator = isGenerator;
    }
    if (this.options.ecmaVersion >= 8) {
      node.async = !!isAsync;
    }
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    this.enterScope(functionFlags(isAsync, node.generator) | SCOPE_SUPER | (allowDirectSuper ? SCOPE_DIRECT_SUPER : 0));
    this.expect(types$1.parenL);
    node.params = this.parseBindingList(types$1.parenR, false, this.options.ecmaVersion >= 8);
    this.checkYieldAwaitInDefaultParams();
    this.parseFunctionBody(node, false, true, false);
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "FunctionExpression");
  };
  pp$5.parseArrowExpression = function(node, params, isAsync, forInit) {
    var oldYieldPos = this.yieldPos, oldAwaitPos = this.awaitPos, oldAwaitIdentPos = this.awaitIdentPos;
    this.enterScope(functionFlags(isAsync, false) | SCOPE_ARROW);
    this.initFunction(node);
    if (this.options.ecmaVersion >= 8) {
      node.async = !!isAsync;
    }
    this.yieldPos = 0;
    this.awaitPos = 0;
    this.awaitIdentPos = 0;
    node.params = this.toAssignableList(params, true);
    this.parseFunctionBody(node, true, false, forInit);
    this.yieldPos = oldYieldPos;
    this.awaitPos = oldAwaitPos;
    this.awaitIdentPos = oldAwaitIdentPos;
    return this.finishNode(node, "ArrowFunctionExpression");
  };
  pp$5.parseFunctionBody = function(node, isArrowFunction, isMethod, forInit) {
    var isExpression = isArrowFunction && this.type !== types$1.braceL;
    var oldStrict = this.strict, useStrict = false;
    if (isExpression) {
      node.body = this.parseMaybeAssign(forInit);
      node.expression = true;
      this.checkParams(node, false);
    } else {
      var nonSimple = this.options.ecmaVersion >= 7 && !this.isSimpleParamList(node.params);
      if (!oldStrict || nonSimple) {
        useStrict = this.strictDirective(this.end);
        if (useStrict && nonSimple) {
          this.raiseRecoverable(node.start, "Illegal 'use strict' directive in function with non-simple parameter list");
        }
      }
      var oldLabels = this.labels;
      this.labels = [];
      if (useStrict) {
        this.strict = true;
      }
      this.checkParams(node, !oldStrict && !useStrict && !isArrowFunction && !isMethod && this.isSimpleParamList(node.params));
      if (this.strict && node.id) {
        this.checkLValSimple(node.id, BIND_OUTSIDE);
      }
      node.body = this.parseBlock(false, void 0, useStrict && !oldStrict);
      node.expression = false;
      this.adaptDirectivePrologue(node.body.body);
      this.labels = oldLabels;
    }
    this.exitScope();
  };
  pp$5.isSimpleParamList = function(params) {
    for (var i2 = 0, list2 = params; i2 < list2.length; i2 += 1) {
      var param = list2[i2];
      if (param.type !== "Identifier") {
        return false;
      }
    }
    return true;
  };
  pp$5.checkParams = function(node, allowDuplicates) {
    var nameHash = /* @__PURE__ */ Object.create(null);
    for (var i2 = 0, list2 = node.params; i2 < list2.length; i2 += 1) {
      var param = list2[i2];
      this.checkLValInnerPattern(param, BIND_VAR, allowDuplicates ? null : nameHash);
    }
  };
  pp$5.parseExprList = function(close, allowTrailingComma, allowEmpty, refDestructuringErrors) {
    var elts = [], first = true;
    while (!this.eat(close)) {
      if (!first) {
        this.expect(types$1.comma);
        if (allowTrailingComma && this.afterTrailingComma(close)) {
          break;
        }
      } else {
        first = false;
      }
      var elt = void 0;
      if (allowEmpty && this.type === types$1.comma) {
        elt = null;
      } else if (this.type === types$1.ellipsis) {
        elt = this.parseSpread(refDestructuringErrors);
        if (refDestructuringErrors && this.type === types$1.comma && refDestructuringErrors.trailingComma < 0) {
          refDestructuringErrors.trailingComma = this.start;
        }
      } else {
        elt = this.parseMaybeAssign(false, refDestructuringErrors);
      }
      elts.push(elt);
    }
    return elts;
  };
  pp$5.checkUnreserved = function(ref2) {
    var start = ref2.start;
    var end = ref2.end;
    var name = ref2.name;
    if (this.inGenerator && name === "yield") {
      this.raiseRecoverable(start, "Cannot use 'yield' as identifier inside a generator");
    }
    if (this.inAsync && name === "await") {
      this.raiseRecoverable(start, "Cannot use 'await' as identifier inside an async function");
    }
    if (!(this.currentThisScope().flags & SCOPE_VAR) && name === "arguments") {
      this.raiseRecoverable(start, "Cannot use 'arguments' in class field initializer");
    }
    if (this.inClassStaticBlock && (name === "arguments" || name === "await")) {
      this.raise(start, "Cannot use " + name + " in class static initialization block");
    }
    if (this.keywords.test(name)) {
      this.raise(start, "Unexpected keyword '" + name + "'");
    }
    if (this.options.ecmaVersion < 6 && this.input.slice(start, end).indexOf("\\") !== -1) {
      return;
    }
    var re = this.strict ? this.reservedWordsStrict : this.reservedWords;
    if (re.test(name)) {
      if (!this.inAsync && name === "await") {
        this.raiseRecoverable(start, "Cannot use keyword 'await' outside an async function");
      }
      this.raiseRecoverable(start, "The keyword '" + name + "' is reserved");
    }
  };
  pp$5.parseIdent = function(liberal) {
    var node = this.parseIdentNode();
    this.next(!!liberal);
    this.finishNode(node, "Identifier");
    if (!liberal) {
      this.checkUnreserved(node);
      if (node.name === "await" && !this.awaitIdentPos) {
        this.awaitIdentPos = node.start;
      }
    }
    return node;
  };
  pp$5.parseIdentNode = function() {
    var node = this.startNode();
    if (this.type === types$1.name) {
      node.name = this.value;
    } else if (this.type.keyword) {
      node.name = this.type.keyword;
      if ((node.name === "class" || node.name === "function") && (this.lastTokEnd !== this.lastTokStart + 1 || this.input.charCodeAt(this.lastTokStart) !== 46)) {
        this.context.pop();
      }
      this.type = types$1.name;
    } else {
      this.unexpected();
    }
    return node;
  };
  pp$5.parsePrivateIdent = function() {
    var node = this.startNode();
    if (this.type === types$1.privateId) {
      node.name = this.value;
    } else {
      this.unexpected();
    }
    this.next();
    this.finishNode(node, "PrivateIdentifier");
    if (this.options.checkPrivateFields) {
      if (this.privateNameStack.length === 0) {
        this.raise(node.start, "Private field '#" + node.name + "' must be declared in an enclosing class");
      } else {
        this.privateNameStack[this.privateNameStack.length - 1].used.push(node);
      }
    }
    return node;
  };
  pp$5.parseYield = function(forInit) {
    if (!this.yieldPos) {
      this.yieldPos = this.start;
    }
    var node = this.startNode();
    this.next();
    if (this.type === types$1.semi || this.canInsertSemicolon() || this.type !== types$1.star && !this.type.startsExpr) {
      node.delegate = false;
      node.argument = null;
    } else {
      node.delegate = this.eat(types$1.star);
      node.argument = this.parseMaybeAssign(forInit);
    }
    return this.finishNode(node, "YieldExpression");
  };
  pp$5.parseAwait = function(forInit) {
    if (!this.awaitPos) {
      this.awaitPos = this.start;
    }
    var node = this.startNode();
    this.next();
    node.argument = this.parseMaybeUnary(null, true, false, forInit);
    return this.finishNode(node, "AwaitExpression");
  };
  var pp$4 = Parser.prototype;
  pp$4.raise = function(pos, message) {
    var loc = getLineInfo(this.input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    if (this.sourceFile) {
      message += " in " + this.sourceFile;
    }
    var err = new SyntaxError(message);
    err.pos = pos;
    err.loc = loc;
    err.raisedAt = this.pos;
    throw err;
  };
  pp$4.raiseRecoverable = pp$4.raise;
  pp$4.curPosition = function() {
    if (this.options.locations) {
      return new Position(this.curLine, this.pos - this.lineStart);
    }
  };
  var pp$3 = Parser.prototype;
  var Scope = function Scope2(flags) {
    this.flags = flags;
    this.var = [];
    this.lexical = [];
    this.functions = [];
  };
  pp$3.enterScope = function(flags) {
    this.scopeStack.push(new Scope(flags));
  };
  pp$3.exitScope = function() {
    this.scopeStack.pop();
  };
  pp$3.treatFunctionsAsVarInScope = function(scope) {
    return scope.flags & SCOPE_FUNCTION || !this.inModule && scope.flags & SCOPE_TOP;
  };
  pp$3.declareName = function(name, bindingType, pos) {
    var redeclared = false;
    if (bindingType === BIND_LEXICAL) {
      var scope = this.currentScope();
      redeclared = scope.lexical.indexOf(name) > -1 || scope.functions.indexOf(name) > -1 || scope.var.indexOf(name) > -1;
      scope.lexical.push(name);
      if (this.inModule && scope.flags & SCOPE_TOP) {
        delete this.undefinedExports[name];
      }
    } else if (bindingType === BIND_SIMPLE_CATCH) {
      var scope$1 = this.currentScope();
      scope$1.lexical.push(name);
    } else if (bindingType === BIND_FUNCTION) {
      var scope$2 = this.currentScope();
      if (this.treatFunctionsAsVar) {
        redeclared = scope$2.lexical.indexOf(name) > -1;
      } else {
        redeclared = scope$2.lexical.indexOf(name) > -1 || scope$2.var.indexOf(name) > -1;
      }
      scope$2.functions.push(name);
    } else {
      for (var i2 = this.scopeStack.length - 1; i2 >= 0; --i2) {
        var scope$3 = this.scopeStack[i2];
        if (scope$3.lexical.indexOf(name) > -1 && !(scope$3.flags & SCOPE_SIMPLE_CATCH && scope$3.lexical[0] === name) || !this.treatFunctionsAsVarInScope(scope$3) && scope$3.functions.indexOf(name) > -1) {
          redeclared = true;
          break;
        }
        scope$3.var.push(name);
        if (this.inModule && scope$3.flags & SCOPE_TOP) {
          delete this.undefinedExports[name];
        }
        if (scope$3.flags & SCOPE_VAR) {
          break;
        }
      }
    }
    if (redeclared) {
      this.raiseRecoverable(pos, "Identifier '" + name + "' has already been declared");
    }
  };
  pp$3.checkLocalExport = function(id) {
    if (this.scopeStack[0].lexical.indexOf(id.name) === -1 && this.scopeStack[0].var.indexOf(id.name) === -1) {
      this.undefinedExports[id.name] = id;
    }
  };
  pp$3.currentScope = function() {
    return this.scopeStack[this.scopeStack.length - 1];
  };
  pp$3.currentVarScope = function() {
    for (var i2 = this.scopeStack.length - 1; ; i2--) {
      var scope = this.scopeStack[i2];
      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK)) {
        return scope;
      }
    }
  };
  pp$3.currentThisScope = function() {
    for (var i2 = this.scopeStack.length - 1; ; i2--) {
      var scope = this.scopeStack[i2];
      if (scope.flags & (SCOPE_VAR | SCOPE_CLASS_FIELD_INIT | SCOPE_CLASS_STATIC_BLOCK) && !(scope.flags & SCOPE_ARROW)) {
        return scope;
      }
    }
  };
  var Node = function Node2(parser, pos, loc) {
    this.type = "";
    this.start = pos;
    this.end = 0;
    if (parser.options.locations) {
      this.loc = new SourceLocation(parser, loc);
    }
    if (parser.options.directSourceFile) {
      this.sourceFile = parser.options.directSourceFile;
    }
    if (parser.options.ranges) {
      this.range = [pos, 0];
    }
  };
  var pp$2 = Parser.prototype;
  pp$2.startNode = function() {
    return new Node(this, this.start, this.startLoc);
  };
  pp$2.startNodeAt = function(pos, loc) {
    return new Node(this, pos, loc);
  };
  function finishNodeAt(node, type, pos, loc) {
    node.type = type;
    node.end = pos;
    if (this.options.locations) {
      node.loc.end = loc;
    }
    if (this.options.ranges) {
      node.range[1] = pos;
    }
    return node;
  }
  pp$2.finishNode = function(node, type) {
    return finishNodeAt.call(this, node, type, this.lastTokEnd, this.lastTokEndLoc);
  };
  pp$2.finishNodeAt = function(node, type, pos, loc) {
    return finishNodeAt.call(this, node, type, pos, loc);
  };
  pp$2.copyNode = function(node) {
    var newNode = new Node(this, node.start, this.startLoc);
    for (var prop in node) {
      newNode[prop] = node[prop];
    }
    return newNode;
  };
  var scriptValuesAddedInUnicode = "Gara Garay Gukh Gurung_Khema Hrkt Katakana_Or_Hiragana Kawi Kirat_Rai Krai Nag_Mundari Nagm Ol_Onal Onao Sunu Sunuwar Todhri Todr Tulu_Tigalari Tutg Unknown Zzzz";
  var ecma9BinaryProperties = "ASCII ASCII_Hex_Digit AHex Alphabetic Alpha Any Assigned Bidi_Control Bidi_C Bidi_Mirrored Bidi_M Case_Ignorable CI Cased Changes_When_Casefolded CWCF Changes_When_Casemapped CWCM Changes_When_Lowercased CWL Changes_When_NFKC_Casefolded CWKCF Changes_When_Titlecased CWT Changes_When_Uppercased CWU Dash Default_Ignorable_Code_Point DI Deprecated Dep Diacritic Dia Emoji Emoji_Component Emoji_Modifier Emoji_Modifier_Base Emoji_Presentation Extender Ext Grapheme_Base Gr_Base Grapheme_Extend Gr_Ext Hex_Digit Hex IDS_Binary_Operator IDSB IDS_Trinary_Operator IDST ID_Continue IDC ID_Start IDS Ideographic Ideo Join_Control Join_C Logical_Order_Exception LOE Lowercase Lower Math Noncharacter_Code_Point NChar Pattern_Syntax Pat_Syn Pattern_White_Space Pat_WS Quotation_Mark QMark Radical Regional_Indicator RI Sentence_Terminal STerm Soft_Dotted SD Terminal_Punctuation Term Unified_Ideograph UIdeo Uppercase Upper Variation_Selector VS White_Space space XID_Continue XIDC XID_Start XIDS";
  var ecma10BinaryProperties = ecma9BinaryProperties + " Extended_Pictographic";
  var ecma11BinaryProperties = ecma10BinaryProperties;
  var ecma12BinaryProperties = ecma11BinaryProperties + " EBase EComp EMod EPres ExtPict";
  var ecma13BinaryProperties = ecma12BinaryProperties;
  var ecma14BinaryProperties = ecma13BinaryProperties;
  var unicodeBinaryProperties = {
    9: ecma9BinaryProperties,
    10: ecma10BinaryProperties,
    11: ecma11BinaryProperties,
    12: ecma12BinaryProperties,
    13: ecma13BinaryProperties,
    14: ecma14BinaryProperties
  };
  var ecma14BinaryPropertiesOfStrings = "Basic_Emoji Emoji_Keycap_Sequence RGI_Emoji_Modifier_Sequence RGI_Emoji_Flag_Sequence RGI_Emoji_Tag_Sequence RGI_Emoji_ZWJ_Sequence RGI_Emoji";
  var unicodeBinaryPropertiesOfStrings = {
    9: "",
    10: "",
    11: "",
    12: "",
    13: "",
    14: ecma14BinaryPropertiesOfStrings
  };
  var unicodeGeneralCategoryValues = "Cased_Letter LC Close_Punctuation Pe Connector_Punctuation Pc Control Cc cntrl Currency_Symbol Sc Dash_Punctuation Pd Decimal_Number Nd digit Enclosing_Mark Me Final_Punctuation Pf Format Cf Initial_Punctuation Pi Letter L Letter_Number Nl Line_Separator Zl Lowercase_Letter Ll Mark M Combining_Mark Math_Symbol Sm Modifier_Letter Lm Modifier_Symbol Sk Nonspacing_Mark Mn Number N Open_Punctuation Ps Other C Other_Letter Lo Other_Number No Other_Punctuation Po Other_Symbol So Paragraph_Separator Zp Private_Use Co Punctuation P punct Separator Z Space_Separator Zs Spacing_Mark Mc Surrogate Cs Symbol S Titlecase_Letter Lt Unassigned Cn Uppercase_Letter Lu";
  var ecma9ScriptValues = "Adlam Adlm Ahom Anatolian_Hieroglyphs Hluw Arabic Arab Armenian Armn Avestan Avst Balinese Bali Bamum Bamu Bassa_Vah Bass Batak Batk Bengali Beng Bhaiksuki Bhks Bopomofo Bopo Brahmi Brah Braille Brai Buginese Bugi Buhid Buhd Canadian_Aboriginal Cans Carian Cari Caucasian_Albanian Aghb Chakma Cakm Cham Cham Cherokee Cher Common Zyyy Coptic Copt Qaac Cuneiform Xsux Cypriot Cprt Cyrillic Cyrl Deseret Dsrt Devanagari Deva Duployan Dupl Egyptian_Hieroglyphs Egyp Elbasan Elba Ethiopic Ethi Georgian Geor Glagolitic Glag Gothic Goth Grantha Gran Greek Grek Gujarati Gujr Gurmukhi Guru Han Hani Hangul Hang Hanunoo Hano Hatran Hatr Hebrew Hebr Hiragana Hira Imperial_Aramaic Armi Inherited Zinh Qaai Inscriptional_Pahlavi Phli Inscriptional_Parthian Prti Javanese Java Kaithi Kthi Kannada Knda Katakana Kana Kayah_Li Kali Kharoshthi Khar Khmer Khmr Khojki Khoj Khudawadi Sind Lao Laoo Latin Latn Lepcha Lepc Limbu Limb Linear_A Lina Linear_B Linb Lisu Lisu Lycian Lyci Lydian Lydi Mahajani Mahj Malayalam Mlym Mandaic Mand Manichaean Mani Marchen Marc Masaram_Gondi Gonm Meetei_Mayek Mtei Mende_Kikakui Mend Meroitic_Cursive Merc Meroitic_Hieroglyphs Mero Miao Plrd Modi Mongolian Mong Mro Mroo Multani Mult Myanmar Mymr Nabataean Nbat New_Tai_Lue Talu Newa Newa Nko Nkoo Nushu Nshu Ogham Ogam Ol_Chiki Olck Old_Hungarian Hung Old_Italic Ital Old_North_Arabian Narb Old_Permic Perm Old_Persian Xpeo Old_South_Arabian Sarb Old_Turkic Orkh Oriya Orya Osage Osge Osmanya Osma Pahawh_Hmong Hmng Palmyrene Palm Pau_Cin_Hau Pauc Phags_Pa Phag Phoenician Phnx Psalter_Pahlavi Phlp Rejang Rjng Runic Runr Samaritan Samr Saurashtra Saur Sharada Shrd Shavian Shaw Siddham Sidd SignWriting Sgnw Sinhala Sinh Sora_Sompeng Sora Soyombo Soyo Sundanese Sund Syloti_Nagri Sylo Syriac Syrc Tagalog Tglg Tagbanwa Tagb Tai_Le Tale Tai_Tham Lana Tai_Viet Tavt Takri Takr Tamil Taml Tangut Tang Telugu Telu Thaana Thaa Thai Thai Tibetan Tibt Tifinagh Tfng Tirhuta Tirh Ugaritic Ugar Vai Vaii Warang_Citi Wara Yi Yiii Zanabazar_Square Zanb";
  var ecma10ScriptValues = ecma9ScriptValues + " Dogra Dogr Gunjala_Gondi Gong Hanifi_Rohingya Rohg Makasar Maka Medefaidrin Medf Old_Sogdian Sogo Sogdian Sogd";
  var ecma11ScriptValues = ecma10ScriptValues + " Elymaic Elym Nandinagari Nand Nyiakeng_Puachue_Hmong Hmnp Wancho Wcho";
  var ecma12ScriptValues = ecma11ScriptValues + " Chorasmian Chrs Diak Dives_Akuru Khitan_Small_Script Kits Yezi Yezidi";
  var ecma13ScriptValues = ecma12ScriptValues + " Cypro_Minoan Cpmn Old_Uyghur Ougr Tangsa Tnsa Toto Vithkuqi Vith";
  var ecma14ScriptValues = ecma13ScriptValues + " " + scriptValuesAddedInUnicode;
  var unicodeScriptValues = {
    9: ecma9ScriptValues,
    10: ecma10ScriptValues,
    11: ecma11ScriptValues,
    12: ecma12ScriptValues,
    13: ecma13ScriptValues,
    14: ecma14ScriptValues
  };
  var data = {};
  function buildUnicodeData(ecmaVersion2) {
    var d = data[ecmaVersion2] = {
      binary: wordsRegexp(unicodeBinaryProperties[ecmaVersion2] + " " + unicodeGeneralCategoryValues),
      binaryOfStrings: wordsRegexp(unicodeBinaryPropertiesOfStrings[ecmaVersion2]),
      nonBinary: {
        General_Category: wordsRegexp(unicodeGeneralCategoryValues),
        Script: wordsRegexp(unicodeScriptValues[ecmaVersion2])
      }
    };
    d.nonBinary.Script_Extensions = d.nonBinary.Script;
    d.nonBinary.gc = d.nonBinary.General_Category;
    d.nonBinary.sc = d.nonBinary.Script;
    d.nonBinary.scx = d.nonBinary.Script_Extensions;
  }
  for (var i = 0, list = [9, 10, 11, 12, 13, 14]; i < list.length; i += 1) {
    var ecmaVersion = list[i];
    buildUnicodeData(ecmaVersion);
  }
  var pp$1 = Parser.prototype;
  var BranchID = function BranchID2(parent, base) {
    this.parent = parent;
    this.base = base || this;
  };
  BranchID.prototype.separatedFrom = function separatedFrom(alt) {
    for (var self2 = this; self2; self2 = self2.parent) {
      for (var other = alt; other; other = other.parent) {
        if (self2.base === other.base && self2 !== other) {
          return true;
        }
      }
    }
    return false;
  };
  BranchID.prototype.sibling = function sibling() {
    return new BranchID(this.parent, this.base);
  };
  var RegExpValidationState = function RegExpValidationState2(parser) {
    this.parser = parser;
    this.validFlags = "gim" + (parser.options.ecmaVersion >= 6 ? "uy" : "") + (parser.options.ecmaVersion >= 9 ? "s" : "") + (parser.options.ecmaVersion >= 13 ? "d" : "") + (parser.options.ecmaVersion >= 15 ? "v" : "");
    this.unicodeProperties = data[parser.options.ecmaVersion >= 14 ? 14 : parser.options.ecmaVersion];
    this.source = "";
    this.flags = "";
    this.start = 0;
    this.switchU = false;
    this.switchV = false;
    this.switchN = false;
    this.pos = 0;
    this.lastIntValue = 0;
    this.lastStringValue = "";
    this.lastAssertionIsQuantifiable = false;
    this.numCapturingParens = 0;
    this.maxBackReference = 0;
    this.groupNames = /* @__PURE__ */ Object.create(null);
    this.backReferenceNames = [];
    this.branchID = null;
  };
  RegExpValidationState.prototype.reset = function reset(start, pattern, flags) {
    var unicodeSets = flags.indexOf("v") !== -1;
    var unicode = flags.indexOf("u") !== -1;
    this.start = start | 0;
    this.source = pattern + "";
    this.flags = flags;
    if (unicodeSets && this.parser.options.ecmaVersion >= 15) {
      this.switchU = true;
      this.switchV = true;
      this.switchN = true;
    } else {
      this.switchU = unicode && this.parser.options.ecmaVersion >= 6;
      this.switchV = false;
      this.switchN = unicode && this.parser.options.ecmaVersion >= 9;
    }
  };
  RegExpValidationState.prototype.raise = function raise(message) {
    this.parser.raiseRecoverable(this.start, "Invalid regular expression: /" + this.source + "/: " + message);
  };
  RegExpValidationState.prototype.at = function at(i2, forceU) {
    if (forceU === void 0) forceU = false;
    var s = this.source;
    var l = s.length;
    if (i2 >= l) {
      return -1;
    }
    var c = s.charCodeAt(i2);
    if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i2 + 1 >= l) {
      return c;
    }
    var next = s.charCodeAt(i2 + 1);
    return next >= 56320 && next <= 57343 ? (c << 10) + next - 56613888 : c;
  };
  RegExpValidationState.prototype.nextIndex = function nextIndex(i2, forceU) {
    if (forceU === void 0) forceU = false;
    var s = this.source;
    var l = s.length;
    if (i2 >= l) {
      return l;
    }
    var c = s.charCodeAt(i2), next;
    if (!(forceU || this.switchU) || c <= 55295 || c >= 57344 || i2 + 1 >= l || (next = s.charCodeAt(i2 + 1)) < 56320 || next > 57343) {
      return i2 + 1;
    }
    return i2 + 2;
  };
  RegExpValidationState.prototype.current = function current(forceU) {
    if (forceU === void 0) forceU = false;
    return this.at(this.pos, forceU);
  };
  RegExpValidationState.prototype.lookahead = function lookahead(forceU) {
    if (forceU === void 0) forceU = false;
    return this.at(this.nextIndex(this.pos, forceU), forceU);
  };
  RegExpValidationState.prototype.advance = function advance(forceU) {
    if (forceU === void 0) forceU = false;
    this.pos = this.nextIndex(this.pos, forceU);
  };
  RegExpValidationState.prototype.eat = function eat(ch, forceU) {
    if (forceU === void 0) forceU = false;
    if (this.current(forceU) === ch) {
      this.advance(forceU);
      return true;
    }
    return false;
  };
  RegExpValidationState.prototype.eatChars = function eatChars(chs, forceU) {
    if (forceU === void 0) forceU = false;
    var pos = this.pos;
    for (var i2 = 0, list2 = chs; i2 < list2.length; i2 += 1) {
      var ch = list2[i2];
      var current2 = this.at(pos, forceU);
      if (current2 === -1 || current2 !== ch) {
        return false;
      }
      pos = this.nextIndex(pos, forceU);
    }
    this.pos = pos;
    return true;
  };
  pp$1.validateRegExpFlags = function(state) {
    var validFlags = state.validFlags;
    var flags = state.flags;
    var u = false;
    var v2 = false;
    for (var i2 = 0; i2 < flags.length; i2++) {
      var flag = flags.charAt(i2);
      if (validFlags.indexOf(flag) === -1) {
        this.raise(state.start, "Invalid regular expression flag");
      }
      if (flags.indexOf(flag, i2 + 1) > -1) {
        this.raise(state.start, "Duplicate regular expression flag");
      }
      if (flag === "u") {
        u = true;
      }
      if (flag === "v") {
        v2 = true;
      }
    }
    if (this.options.ecmaVersion >= 15 && u && v2) {
      this.raise(state.start, "Invalid regular expression flag");
    }
  };
  function hasProp(obj) {
    for (var _ in obj) {
      return true;
    }
    return false;
  }
  pp$1.validateRegExpPattern = function(state) {
    this.regexp_pattern(state);
    if (!state.switchN && this.options.ecmaVersion >= 9 && hasProp(state.groupNames)) {
      state.switchN = true;
      this.regexp_pattern(state);
    }
  };
  pp$1.regexp_pattern = function(state) {
    state.pos = 0;
    state.lastIntValue = 0;
    state.lastStringValue = "";
    state.lastAssertionIsQuantifiable = false;
    state.numCapturingParens = 0;
    state.maxBackReference = 0;
    state.groupNames = /* @__PURE__ */ Object.create(null);
    state.backReferenceNames.length = 0;
    state.branchID = null;
    this.regexp_disjunction(state);
    if (state.pos !== state.source.length) {
      if (state.eat(
        41
        /* ) */
      )) {
        state.raise("Unmatched ')'");
      }
      if (state.eat(
        93
        /* ] */
      ) || state.eat(
        125
        /* } */
      )) {
        state.raise("Lone quantifier brackets");
      }
    }
    if (state.maxBackReference > state.numCapturingParens) {
      state.raise("Invalid escape");
    }
    for (var i2 = 0, list2 = state.backReferenceNames; i2 < list2.length; i2 += 1) {
      var name = list2[i2];
      if (!state.groupNames[name]) {
        state.raise("Invalid named capture referenced");
      }
    }
  };
  pp$1.regexp_disjunction = function(state) {
    var trackDisjunction = this.options.ecmaVersion >= 16;
    if (trackDisjunction) {
      state.branchID = new BranchID(state.branchID, null);
    }
    this.regexp_alternative(state);
    while (state.eat(
      124
      /* | */
    )) {
      if (trackDisjunction) {
        state.branchID = state.branchID.sibling();
      }
      this.regexp_alternative(state);
    }
    if (trackDisjunction) {
      state.branchID = state.branchID.parent;
    }
    if (this.regexp_eatQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    if (state.eat(
      123
      /* { */
    )) {
      state.raise("Lone quantifier brackets");
    }
  };
  pp$1.regexp_alternative = function(state) {
    while (state.pos < state.source.length && this.regexp_eatTerm(state)) {
    }
  };
  pp$1.regexp_eatTerm = function(state) {
    if (this.regexp_eatAssertion(state)) {
      if (state.lastAssertionIsQuantifiable && this.regexp_eatQuantifier(state)) {
        if (state.switchU) {
          state.raise("Invalid quantifier");
        }
      }
      return true;
    }
    if (state.switchU ? this.regexp_eatAtom(state) : this.regexp_eatExtendedAtom(state)) {
      this.regexp_eatQuantifier(state);
      return true;
    }
    return false;
  };
  pp$1.regexp_eatAssertion = function(state) {
    var start = state.pos;
    state.lastAssertionIsQuantifiable = false;
    if (state.eat(
      94
      /* ^ */
    ) || state.eat(
      36
      /* $ */
    )) {
      return true;
    }
    if (state.eat(
      92
      /* \ */
    )) {
      if (state.eat(
        66
        /* B */
      ) || state.eat(
        98
        /* b */
      )) {
        return true;
      }
      state.pos = start;
    }
    if (state.eat(
      40
      /* ( */
    ) && state.eat(
      63
      /* ? */
    )) {
      var lookbehind = false;
      if (this.options.ecmaVersion >= 9) {
        lookbehind = state.eat(
          60
          /* < */
        );
      }
      if (state.eat(
        61
        /* = */
      ) || state.eat(
        33
        /* ! */
      )) {
        this.regexp_disjunction(state);
        if (!state.eat(
          41
          /* ) */
        )) {
          state.raise("Unterminated group");
        }
        state.lastAssertionIsQuantifiable = !lookbehind;
        return true;
      }
    }
    state.pos = start;
    return false;
  };
  pp$1.regexp_eatQuantifier = function(state, noError) {
    if (noError === void 0) noError = false;
    if (this.regexp_eatQuantifierPrefix(state, noError)) {
      state.eat(
        63
        /* ? */
      );
      return true;
    }
    return false;
  };
  pp$1.regexp_eatQuantifierPrefix = function(state, noError) {
    return state.eat(
      42
      /* * */
    ) || state.eat(
      43
      /* + */
    ) || state.eat(
      63
      /* ? */
    ) || this.regexp_eatBracedQuantifier(state, noError);
  };
  pp$1.regexp_eatBracedQuantifier = function(state, noError) {
    var start = state.pos;
    if (state.eat(
      123
      /* { */
    )) {
      var min = 0, max = -1;
      if (this.regexp_eatDecimalDigits(state)) {
        min = state.lastIntValue;
        if (state.eat(
          44
          /* , */
        ) && this.regexp_eatDecimalDigits(state)) {
          max = state.lastIntValue;
        }
        if (state.eat(
          125
          /* } */
        )) {
          if (max !== -1 && max < min && !noError) {
            state.raise("numbers out of order in {} quantifier");
          }
          return true;
        }
      }
      if (state.switchU && !noError) {
        state.raise("Incomplete quantifier");
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatAtom = function(state) {
    return this.regexp_eatPatternCharacters(state) || state.eat(
      46
      /* . */
    ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state);
  };
  pp$1.regexp_eatReverseSolidusAtomEscape = function(state) {
    var start = state.pos;
    if (state.eat(
      92
      /* \ */
    )) {
      if (this.regexp_eatAtomEscape(state)) {
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatUncapturingGroup = function(state) {
    var start = state.pos;
    if (state.eat(
      40
      /* ( */
    )) {
      if (state.eat(
        63
        /* ? */
      )) {
        if (this.options.ecmaVersion >= 16) {
          var addModifiers = this.regexp_eatModifiers(state);
          var hasHyphen = state.eat(
            45
            /* - */
          );
          if (addModifiers || hasHyphen) {
            for (var i2 = 0; i2 < addModifiers.length; i2++) {
              var modifier = addModifiers.charAt(i2);
              if (addModifiers.indexOf(modifier, i2 + 1) > -1) {
                state.raise("Duplicate regular expression modifiers");
              }
            }
            if (hasHyphen) {
              var removeModifiers = this.regexp_eatModifiers(state);
              if (!addModifiers && !removeModifiers && state.current() === 58) {
                state.raise("Invalid regular expression modifiers");
              }
              for (var i$1 = 0; i$1 < removeModifiers.length; i$1++) {
                var modifier$1 = removeModifiers.charAt(i$1);
                if (removeModifiers.indexOf(modifier$1, i$1 + 1) > -1 || addModifiers.indexOf(modifier$1) > -1) {
                  state.raise("Duplicate regular expression modifiers");
                }
              }
            }
          }
        }
        if (state.eat(
          58
          /* : */
        )) {
          this.regexp_disjunction(state);
          if (state.eat(
            41
            /* ) */
          )) {
            return true;
          }
          state.raise("Unterminated group");
        }
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatCapturingGroup = function(state) {
    if (state.eat(
      40
      /* ( */
    )) {
      if (this.options.ecmaVersion >= 9) {
        this.regexp_groupSpecifier(state);
      } else if (state.current() === 63) {
        state.raise("Invalid group");
      }
      this.regexp_disjunction(state);
      if (state.eat(
        41
        /* ) */
      )) {
        state.numCapturingParens += 1;
        return true;
      }
      state.raise("Unterminated group");
    }
    return false;
  };
  pp$1.regexp_eatModifiers = function(state) {
    var modifiers = "";
    var ch = 0;
    while ((ch = state.current()) !== -1 && isRegularExpressionModifier(ch)) {
      modifiers += codePointToString(ch);
      state.advance();
    }
    return modifiers;
  };
  function isRegularExpressionModifier(ch) {
    return ch === 105 || ch === 109 || ch === 115;
  }
  pp$1.regexp_eatExtendedAtom = function(state) {
    return state.eat(
      46
      /* . */
    ) || this.regexp_eatReverseSolidusAtomEscape(state) || this.regexp_eatCharacterClass(state) || this.regexp_eatUncapturingGroup(state) || this.regexp_eatCapturingGroup(state) || this.regexp_eatInvalidBracedQuantifier(state) || this.regexp_eatExtendedPatternCharacter(state);
  };
  pp$1.regexp_eatInvalidBracedQuantifier = function(state) {
    if (this.regexp_eatBracedQuantifier(state, true)) {
      state.raise("Nothing to repeat");
    }
    return false;
  };
  pp$1.regexp_eatSyntaxCharacter = function(state) {
    var ch = state.current();
    if (isSyntaxCharacter(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  function isSyntaxCharacter(ch) {
    return ch === 36 || ch >= 40 && ch <= 43 || ch === 46 || ch === 63 || ch >= 91 && ch <= 94 || ch >= 123 && ch <= 125;
  }
  pp$1.regexp_eatPatternCharacters = function(state) {
    var start = state.pos;
    var ch = 0;
    while ((ch = state.current()) !== -1 && !isSyntaxCharacter(ch)) {
      state.advance();
    }
    return state.pos !== start;
  };
  pp$1.regexp_eatExtendedPatternCharacter = function(state) {
    var ch = state.current();
    if (ch !== -1 && ch !== 36 && !(ch >= 40 && ch <= 43) && ch !== 46 && ch !== 63 && ch !== 91 && ch !== 94 && ch !== 124) {
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_groupSpecifier = function(state) {
    if (state.eat(
      63
      /* ? */
    )) {
      if (!this.regexp_eatGroupName(state)) {
        state.raise("Invalid group");
      }
      var trackDisjunction = this.options.ecmaVersion >= 16;
      var known = state.groupNames[state.lastStringValue];
      if (known) {
        if (trackDisjunction) {
          for (var i2 = 0, list2 = known; i2 < list2.length; i2 += 1) {
            var altID = list2[i2];
            if (!altID.separatedFrom(state.branchID)) {
              state.raise("Duplicate capture group name");
            }
          }
        } else {
          state.raise("Duplicate capture group name");
        }
      }
      if (trackDisjunction) {
        (known || (state.groupNames[state.lastStringValue] = [])).push(state.branchID);
      } else {
        state.groupNames[state.lastStringValue] = true;
      }
    }
  };
  pp$1.regexp_eatGroupName = function(state) {
    state.lastStringValue = "";
    if (state.eat(
      60
      /* < */
    )) {
      if (this.regexp_eatRegExpIdentifierName(state) && state.eat(
        62
        /* > */
      )) {
        return true;
      }
      state.raise("Invalid capture group name");
    }
    return false;
  };
  pp$1.regexp_eatRegExpIdentifierName = function(state) {
    state.lastStringValue = "";
    if (this.regexp_eatRegExpIdentifierStart(state)) {
      state.lastStringValue += codePointToString(state.lastIntValue);
      while (this.regexp_eatRegExpIdentifierPart(state)) {
        state.lastStringValue += codePointToString(state.lastIntValue);
      }
      return true;
    }
    return false;
  };
  pp$1.regexp_eatRegExpIdentifierStart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);
    if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierStart(ch)) {
      state.lastIntValue = ch;
      return true;
    }
    state.pos = start;
    return false;
  };
  function isRegExpIdentifierStart(ch) {
    return isIdentifierStart(ch, true) || ch === 36 || ch === 95;
  }
  pp$1.regexp_eatRegExpIdentifierPart = function(state) {
    var start = state.pos;
    var forceU = this.options.ecmaVersion >= 11;
    var ch = state.current(forceU);
    state.advance(forceU);
    if (ch === 92 && this.regexp_eatRegExpUnicodeEscapeSequence(state, forceU)) {
      ch = state.lastIntValue;
    }
    if (isRegExpIdentifierPart(ch)) {
      state.lastIntValue = ch;
      return true;
    }
    state.pos = start;
    return false;
  };
  function isRegExpIdentifierPart(ch) {
    return isIdentifierChar(ch, true) || ch === 36 || ch === 95 || ch === 8204 || ch === 8205;
  }
  pp$1.regexp_eatAtomEscape = function(state) {
    if (this.regexp_eatBackReference(state) || this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state) || state.switchN && this.regexp_eatKGroupName(state)) {
      return true;
    }
    if (state.switchU) {
      if (state.current() === 99) {
        state.raise("Invalid unicode escape");
      }
      state.raise("Invalid escape");
    }
    return false;
  };
  pp$1.regexp_eatBackReference = function(state) {
    var start = state.pos;
    if (this.regexp_eatDecimalEscape(state)) {
      var n = state.lastIntValue;
      if (state.switchU) {
        if (n > state.maxBackReference) {
          state.maxBackReference = n;
        }
        return true;
      }
      if (n <= state.numCapturingParens) {
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatKGroupName = function(state) {
    if (state.eat(
      107
      /* k */
    )) {
      if (this.regexp_eatGroupName(state)) {
        state.backReferenceNames.push(state.lastStringValue);
        return true;
      }
      state.raise("Invalid named reference");
    }
    return false;
  };
  pp$1.regexp_eatCharacterEscape = function(state) {
    return this.regexp_eatControlEscape(state) || this.regexp_eatCControlLetter(state) || this.regexp_eatZero(state) || this.regexp_eatHexEscapeSequence(state) || this.regexp_eatRegExpUnicodeEscapeSequence(state, false) || !state.switchU && this.regexp_eatLegacyOctalEscapeSequence(state) || this.regexp_eatIdentityEscape(state);
  };
  pp$1.regexp_eatCControlLetter = function(state) {
    var start = state.pos;
    if (state.eat(
      99
      /* c */
    )) {
      if (this.regexp_eatControlLetter(state)) {
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatZero = function(state) {
    if (state.current() === 48 && !isDecimalDigit(state.lookahead())) {
      state.lastIntValue = 0;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatControlEscape = function(state) {
    var ch = state.current();
    if (ch === 116) {
      state.lastIntValue = 9;
      state.advance();
      return true;
    }
    if (ch === 110) {
      state.lastIntValue = 10;
      state.advance();
      return true;
    }
    if (ch === 118) {
      state.lastIntValue = 11;
      state.advance();
      return true;
    }
    if (ch === 102) {
      state.lastIntValue = 12;
      state.advance();
      return true;
    }
    if (ch === 114) {
      state.lastIntValue = 13;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatControlLetter = function(state) {
    var ch = state.current();
    if (isControlLetter(ch)) {
      state.lastIntValue = ch % 32;
      state.advance();
      return true;
    }
    return false;
  };
  function isControlLetter(ch) {
    return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122;
  }
  pp$1.regexp_eatRegExpUnicodeEscapeSequence = function(state, forceU) {
    if (forceU === void 0) forceU = false;
    var start = state.pos;
    var switchU = forceU || state.switchU;
    if (state.eat(
      117
      /* u */
    )) {
      if (this.regexp_eatFixedHexDigits(state, 4)) {
        var lead = state.lastIntValue;
        if (switchU && lead >= 55296 && lead <= 56319) {
          var leadSurrogateEnd = state.pos;
          if (state.eat(
            92
            /* \ */
          ) && state.eat(
            117
            /* u */
          ) && this.regexp_eatFixedHexDigits(state, 4)) {
            var trail = state.lastIntValue;
            if (trail >= 56320 && trail <= 57343) {
              state.lastIntValue = (lead - 55296) * 1024 + (trail - 56320) + 65536;
              return true;
            }
          }
          state.pos = leadSurrogateEnd;
          state.lastIntValue = lead;
        }
        return true;
      }
      if (switchU && state.eat(
        123
        /* { */
      ) && this.regexp_eatHexDigits(state) && state.eat(
        125
        /* } */
      ) && isValidUnicode(state.lastIntValue)) {
        return true;
      }
      if (switchU) {
        state.raise("Invalid unicode escape");
      }
      state.pos = start;
    }
    return false;
  };
  function isValidUnicode(ch) {
    return ch >= 0 && ch <= 1114111;
  }
  pp$1.regexp_eatIdentityEscape = function(state) {
    if (state.switchU) {
      if (this.regexp_eatSyntaxCharacter(state)) {
        return true;
      }
      if (state.eat(
        47
        /* / */
      )) {
        state.lastIntValue = 47;
        return true;
      }
      return false;
    }
    var ch = state.current();
    if (ch !== 99 && (!state.switchN || ch !== 107)) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatDecimalEscape = function(state) {
    state.lastIntValue = 0;
    var ch = state.current();
    if (ch >= 49 && ch <= 57) {
      do {
        state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
        state.advance();
      } while ((ch = state.current()) >= 48 && ch <= 57);
      return true;
    }
    return false;
  };
  var CharSetNone = 0;
  var CharSetOk = 1;
  var CharSetString = 2;
  pp$1.regexp_eatCharacterClassEscape = function(state) {
    var ch = state.current();
    if (isCharacterClassEscape(ch)) {
      state.lastIntValue = -1;
      state.advance();
      return CharSetOk;
    }
    var negate = false;
    if (state.switchU && this.options.ecmaVersion >= 9 && ((negate = ch === 80) || ch === 112)) {
      state.lastIntValue = -1;
      state.advance();
      var result;
      if (state.eat(
        123
        /* { */
      ) && (result = this.regexp_eatUnicodePropertyValueExpression(state)) && state.eat(
        125
        /* } */
      )) {
        if (negate && result === CharSetString) {
          state.raise("Invalid property name");
        }
        return result;
      }
      state.raise("Invalid property name");
    }
    return CharSetNone;
  };
  function isCharacterClassEscape(ch) {
    return ch === 100 || ch === 68 || ch === 115 || ch === 83 || ch === 119 || ch === 87;
  }
  pp$1.regexp_eatUnicodePropertyValueExpression = function(state) {
    var start = state.pos;
    if (this.regexp_eatUnicodePropertyName(state) && state.eat(
      61
      /* = */
    )) {
      var name = state.lastStringValue;
      if (this.regexp_eatUnicodePropertyValue(state)) {
        var value = state.lastStringValue;
        this.regexp_validateUnicodePropertyNameAndValue(state, name, value);
        return CharSetOk;
      }
    }
    state.pos = start;
    if (this.regexp_eatLoneUnicodePropertyNameOrValue(state)) {
      var nameOrValue = state.lastStringValue;
      return this.regexp_validateUnicodePropertyNameOrValue(state, nameOrValue);
    }
    return CharSetNone;
  };
  pp$1.regexp_validateUnicodePropertyNameAndValue = function(state, name, value) {
    if (!hasOwn(state.unicodeProperties.nonBinary, name)) {
      state.raise("Invalid property name");
    }
    if (!state.unicodeProperties.nonBinary[name].test(value)) {
      state.raise("Invalid property value");
    }
  };
  pp$1.regexp_validateUnicodePropertyNameOrValue = function(state, nameOrValue) {
    if (state.unicodeProperties.binary.test(nameOrValue)) {
      return CharSetOk;
    }
    if (state.switchV && state.unicodeProperties.binaryOfStrings.test(nameOrValue)) {
      return CharSetString;
    }
    state.raise("Invalid property name");
  };
  pp$1.regexp_eatUnicodePropertyName = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyNameCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== "";
  };
  function isUnicodePropertyNameCharacter(ch) {
    return isControlLetter(ch) || ch === 95;
  }
  pp$1.regexp_eatUnicodePropertyValue = function(state) {
    var ch = 0;
    state.lastStringValue = "";
    while (isUnicodePropertyValueCharacter(ch = state.current())) {
      state.lastStringValue += codePointToString(ch);
      state.advance();
    }
    return state.lastStringValue !== "";
  };
  function isUnicodePropertyValueCharacter(ch) {
    return isUnicodePropertyNameCharacter(ch) || isDecimalDigit(ch);
  }
  pp$1.regexp_eatLoneUnicodePropertyNameOrValue = function(state) {
    return this.regexp_eatUnicodePropertyValue(state);
  };
  pp$1.regexp_eatCharacterClass = function(state) {
    if (state.eat(
      91
      /* [ */
    )) {
      var negate = state.eat(
        94
        /* ^ */
      );
      var result = this.regexp_classContents(state);
      if (!state.eat(
        93
        /* ] */
      )) {
        state.raise("Unterminated character class");
      }
      if (negate && result === CharSetString) {
        state.raise("Negated character class may contain strings");
      }
      return true;
    }
    return false;
  };
  pp$1.regexp_classContents = function(state) {
    if (state.current() === 93) {
      return CharSetOk;
    }
    if (state.switchV) {
      return this.regexp_classSetExpression(state);
    }
    this.regexp_nonEmptyClassRanges(state);
    return CharSetOk;
  };
  pp$1.regexp_nonEmptyClassRanges = function(state) {
    while (this.regexp_eatClassAtom(state)) {
      var left = state.lastIntValue;
      if (state.eat(
        45
        /* - */
      ) && this.regexp_eatClassAtom(state)) {
        var right = state.lastIntValue;
        if (state.switchU && (left === -1 || right === -1)) {
          state.raise("Invalid character class");
        }
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
      }
    }
  };
  pp$1.regexp_eatClassAtom = function(state) {
    var start = state.pos;
    if (state.eat(
      92
      /* \ */
    )) {
      if (this.regexp_eatClassEscape(state)) {
        return true;
      }
      if (state.switchU) {
        var ch$1 = state.current();
        if (ch$1 === 99 || isOctalDigit(ch$1)) {
          state.raise("Invalid class escape");
        }
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    var ch = state.current();
    if (ch !== 93) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatClassEscape = function(state) {
    var start = state.pos;
    if (state.eat(
      98
      /* b */
    )) {
      state.lastIntValue = 8;
      return true;
    }
    if (state.switchU && state.eat(
      45
      /* - */
    )) {
      state.lastIntValue = 45;
      return true;
    }
    if (!state.switchU && state.eat(
      99
      /* c */
    )) {
      if (this.regexp_eatClassControlLetter(state)) {
        return true;
      }
      state.pos = start;
    }
    return this.regexp_eatCharacterClassEscape(state) || this.regexp_eatCharacterEscape(state);
  };
  pp$1.regexp_classSetExpression = function(state) {
    var result = CharSetOk, subResult;
    if (this.regexp_eatClassSetRange(state)) ;
    else if (subResult = this.regexp_eatClassSetOperand(state)) {
      if (subResult === CharSetString) {
        result = CharSetString;
      }
      var start = state.pos;
      while (state.eatChars(
        [38, 38]
        /* && */
      )) {
        if (state.current() !== 38 && (subResult = this.regexp_eatClassSetOperand(state))) {
          if (subResult !== CharSetString) {
            result = CharSetOk;
          }
          continue;
        }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) {
        return result;
      }
      while (state.eatChars(
        [45, 45]
        /* -- */
      )) {
        if (this.regexp_eatClassSetOperand(state)) {
          continue;
        }
        state.raise("Invalid character in character class");
      }
      if (start !== state.pos) {
        return result;
      }
    } else {
      state.raise("Invalid character in character class");
    }
    for (; ; ) {
      if (this.regexp_eatClassSetRange(state)) {
        continue;
      }
      subResult = this.regexp_eatClassSetOperand(state);
      if (!subResult) {
        return result;
      }
      if (subResult === CharSetString) {
        result = CharSetString;
      }
    }
  };
  pp$1.regexp_eatClassSetRange = function(state) {
    var start = state.pos;
    if (this.regexp_eatClassSetCharacter(state)) {
      var left = state.lastIntValue;
      if (state.eat(
        45
        /* - */
      ) && this.regexp_eatClassSetCharacter(state)) {
        var right = state.lastIntValue;
        if (left !== -1 && right !== -1 && left > right) {
          state.raise("Range out of order in character class");
        }
        return true;
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatClassSetOperand = function(state) {
    if (this.regexp_eatClassSetCharacter(state)) {
      return CharSetOk;
    }
    return this.regexp_eatClassStringDisjunction(state) || this.regexp_eatNestedClass(state);
  };
  pp$1.regexp_eatNestedClass = function(state) {
    var start = state.pos;
    if (state.eat(
      91
      /* [ */
    )) {
      var negate = state.eat(
        94
        /* ^ */
      );
      var result = this.regexp_classContents(state);
      if (state.eat(
        93
        /* ] */
      )) {
        if (negate && result === CharSetString) {
          state.raise("Negated character class may contain strings");
        }
        return result;
      }
      state.pos = start;
    }
    if (state.eat(
      92
      /* \ */
    )) {
      var result$1 = this.regexp_eatCharacterClassEscape(state);
      if (result$1) {
        return result$1;
      }
      state.pos = start;
    }
    return null;
  };
  pp$1.regexp_eatClassStringDisjunction = function(state) {
    var start = state.pos;
    if (state.eatChars(
      [92, 113]
      /* \q */
    )) {
      if (state.eat(
        123
        /* { */
      )) {
        var result = this.regexp_classStringDisjunctionContents(state);
        if (state.eat(
          125
          /* } */
        )) {
          return result;
        }
      } else {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return null;
  };
  pp$1.regexp_classStringDisjunctionContents = function(state) {
    var result = this.regexp_classString(state);
    while (state.eat(
      124
      /* | */
    )) {
      if (this.regexp_classString(state) === CharSetString) {
        result = CharSetString;
      }
    }
    return result;
  };
  pp$1.regexp_classString = function(state) {
    var count = 0;
    while (this.regexp_eatClassSetCharacter(state)) {
      count++;
    }
    return count === 1 ? CharSetOk : CharSetString;
  };
  pp$1.regexp_eatClassSetCharacter = function(state) {
    var start = state.pos;
    if (state.eat(
      92
      /* \ */
    )) {
      if (this.regexp_eatCharacterEscape(state) || this.regexp_eatClassSetReservedPunctuator(state)) {
        return true;
      }
      if (state.eat(
        98
        /* b */
      )) {
        state.lastIntValue = 8;
        return true;
      }
      state.pos = start;
      return false;
    }
    var ch = state.current();
    if (ch < 0 || ch === state.lookahead() && isClassSetReservedDoublePunctuatorCharacter(ch)) {
      return false;
    }
    if (isClassSetSyntaxCharacter(ch)) {
      return false;
    }
    state.advance();
    state.lastIntValue = ch;
    return true;
  };
  function isClassSetReservedDoublePunctuatorCharacter(ch) {
    return ch === 33 || ch >= 35 && ch <= 38 || ch >= 42 && ch <= 44 || ch === 46 || ch >= 58 && ch <= 64 || ch === 94 || ch === 96 || ch === 126;
  }
  function isClassSetSyntaxCharacter(ch) {
    return ch === 40 || ch === 41 || ch === 45 || ch === 47 || ch >= 91 && ch <= 93 || ch >= 123 && ch <= 125;
  }
  pp$1.regexp_eatClassSetReservedPunctuator = function(state) {
    var ch = state.current();
    if (isClassSetReservedPunctuator(ch)) {
      state.lastIntValue = ch;
      state.advance();
      return true;
    }
    return false;
  };
  function isClassSetReservedPunctuator(ch) {
    return ch === 33 || ch === 35 || ch === 37 || ch === 38 || ch === 44 || ch === 45 || ch >= 58 && ch <= 62 || ch === 64 || ch === 96 || ch === 126;
  }
  pp$1.regexp_eatClassControlLetter = function(state) {
    var ch = state.current();
    if (isDecimalDigit(ch) || ch === 95) {
      state.lastIntValue = ch % 32;
      state.advance();
      return true;
    }
    return false;
  };
  pp$1.regexp_eatHexEscapeSequence = function(state) {
    var start = state.pos;
    if (state.eat(
      120
      /* x */
    )) {
      if (this.regexp_eatFixedHexDigits(state, 2)) {
        return true;
      }
      if (state.switchU) {
        state.raise("Invalid escape");
      }
      state.pos = start;
    }
    return false;
  };
  pp$1.regexp_eatDecimalDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isDecimalDigit(ch = state.current())) {
      state.lastIntValue = 10 * state.lastIntValue + (ch - 48);
      state.advance();
    }
    return state.pos !== start;
  };
  function isDecimalDigit(ch) {
    return ch >= 48 && ch <= 57;
  }
  pp$1.regexp_eatHexDigits = function(state) {
    var start = state.pos;
    var ch = 0;
    state.lastIntValue = 0;
    while (isHexDigit(ch = state.current())) {
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return state.pos !== start;
  };
  function isHexDigit(ch) {
    return ch >= 48 && ch <= 57 || ch >= 65 && ch <= 70 || ch >= 97 && ch <= 102;
  }
  function hexToInt(ch) {
    if (ch >= 65 && ch <= 70) {
      return 10 + (ch - 65);
    }
    if (ch >= 97 && ch <= 102) {
      return 10 + (ch - 97);
    }
    return ch - 48;
  }
  pp$1.regexp_eatLegacyOctalEscapeSequence = function(state) {
    if (this.regexp_eatOctalDigit(state)) {
      var n1 = state.lastIntValue;
      if (this.regexp_eatOctalDigit(state)) {
        var n2 = state.lastIntValue;
        if (n1 <= 3 && this.regexp_eatOctalDigit(state)) {
          state.lastIntValue = n1 * 64 + n2 * 8 + state.lastIntValue;
        } else {
          state.lastIntValue = n1 * 8 + n2;
        }
      } else {
        state.lastIntValue = n1;
      }
      return true;
    }
    return false;
  };
  pp$1.regexp_eatOctalDigit = function(state) {
    var ch = state.current();
    if (isOctalDigit(ch)) {
      state.lastIntValue = ch - 48;
      state.advance();
      return true;
    }
    state.lastIntValue = 0;
    return false;
  };
  function isOctalDigit(ch) {
    return ch >= 48 && ch <= 55;
  }
  pp$1.regexp_eatFixedHexDigits = function(state, length) {
    var start = state.pos;
    state.lastIntValue = 0;
    for (var i2 = 0; i2 < length; ++i2) {
      var ch = state.current();
      if (!isHexDigit(ch)) {
        state.pos = start;
        return false;
      }
      state.lastIntValue = 16 * state.lastIntValue + hexToInt(ch);
      state.advance();
    }
    return true;
  };
  var Token = function Token2(p) {
    this.type = p.type;
    this.value = p.value;
    this.start = p.start;
    this.end = p.end;
    if (p.options.locations) {
      this.loc = new SourceLocation(p, p.startLoc, p.endLoc);
    }
    if (p.options.ranges) {
      this.range = [p.start, p.end];
    }
  };
  var pp = Parser.prototype;
  pp.next = function(ignoreEscapeSequenceInKeyword) {
    if (!ignoreEscapeSequenceInKeyword && this.type.keyword && this.containsEsc) {
      this.raiseRecoverable(this.start, "Escape sequence in keyword " + this.type.keyword);
    }
    if (this.options.onToken) {
      this.options.onToken(new Token(this));
    }
    this.lastTokEnd = this.end;
    this.lastTokStart = this.start;
    this.lastTokEndLoc = this.endLoc;
    this.lastTokStartLoc = this.startLoc;
    this.nextToken();
  };
  pp.getToken = function() {
    this.next();
    return new Token(this);
  };
  if (typeof Symbol !== "undefined") {
    pp[Symbol.iterator] = function() {
      var this$1$1 = this;
      return {
        next: function() {
          var token = this$1$1.getToken();
          return {
            done: token.type === types$1.eof,
            value: token
          };
        }
      };
    };
  }
  pp.nextToken = function() {
    var curContext = this.curContext();
    if (!curContext || !curContext.preserveSpace) {
      this.skipSpace();
    }
    this.start = this.pos;
    if (this.options.locations) {
      this.startLoc = this.curPosition();
    }
    if (this.pos >= this.input.length) {
      return this.finishToken(types$1.eof);
    }
    if (curContext.override) {
      return curContext.override(this);
    } else {
      this.readToken(this.fullCharCodeAtPos());
    }
  };
  pp.readToken = function(code) {
    if (isIdentifierStart(code, this.options.ecmaVersion >= 6) || code === 92) {
      return this.readWord();
    }
    return this.getTokenFromCode(code);
  };
  pp.fullCharCodeAtPos = function() {
    var code = this.input.charCodeAt(this.pos);
    if (code <= 55295 || code >= 56320) {
      return code;
    }
    var next = this.input.charCodeAt(this.pos + 1);
    return next <= 56319 || next >= 57344 ? code : (code << 10) + next - 56613888;
  };
  pp.skipBlockComment = function() {
    var startLoc = this.options.onComment && this.curPosition();
    var start = this.pos, end = this.input.indexOf("*/", this.pos += 2);
    if (end === -1) {
      this.raise(this.pos - 2, "Unterminated comment");
    }
    this.pos = end + 2;
    if (this.options.locations) {
      for (var nextBreak = void 0, pos = start; (nextBreak = nextLineBreak(this.input, pos, this.pos)) > -1; ) {
        ++this.curLine;
        pos = this.lineStart = nextBreak;
      }
    }
    if (this.options.onComment) {
      this.options.onComment(
        true,
        this.input.slice(start + 2, end),
        start,
        this.pos,
        startLoc,
        this.curPosition()
      );
    }
  };
  pp.skipLineComment = function(startSkip) {
    var start = this.pos;
    var startLoc = this.options.onComment && this.curPosition();
    var ch = this.input.charCodeAt(this.pos += startSkip);
    while (this.pos < this.input.length && !isNewLine(ch)) {
      ch = this.input.charCodeAt(++this.pos);
    }
    if (this.options.onComment) {
      this.options.onComment(
        false,
        this.input.slice(start + startSkip, this.pos),
        start,
        this.pos,
        startLoc,
        this.curPosition()
      );
    }
  };
  pp.skipSpace = function() {
    loop: while (this.pos < this.input.length) {
      var ch = this.input.charCodeAt(this.pos);
      switch (ch) {
        case 32:
        case 160:
          ++this.pos;
          break;
        case 13:
          if (this.input.charCodeAt(this.pos + 1) === 10) {
            ++this.pos;
          }
        case 10:
        case 8232:
        case 8233:
          ++this.pos;
          if (this.options.locations) {
            ++this.curLine;
            this.lineStart = this.pos;
          }
          break;
        case 47:
          switch (this.input.charCodeAt(this.pos + 1)) {
            case 42:
              this.skipBlockComment();
              break;
            case 47:
              this.skipLineComment(2);
              break;
            default:
              break loop;
          }
          break;
        default:
          if (ch > 8 && ch < 14 || ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
            ++this.pos;
          } else {
            break loop;
          }
      }
    }
  };
  pp.finishToken = function(type, val) {
    this.end = this.pos;
    if (this.options.locations) {
      this.endLoc = this.curPosition();
    }
    var prevType = this.type;
    this.type = type;
    this.value = val;
    this.updateContext(prevType);
  };
  pp.readToken_dot = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next >= 48 && next <= 57) {
      return this.readNumber(true);
    }
    var next2 = this.input.charCodeAt(this.pos + 2);
    if (this.options.ecmaVersion >= 6 && next === 46 && next2 === 46) {
      this.pos += 3;
      return this.finishToken(types$1.ellipsis);
    } else {
      ++this.pos;
      return this.finishToken(types$1.dot);
    }
  };
  pp.readToken_slash = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (this.exprAllowed) {
      ++this.pos;
      return this.readRegexp();
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(types$1.slash, 1);
  };
  pp.readToken_mult_modulo_exp = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    var tokentype = code === 42 ? types$1.star : types$1.modulo;
    if (this.options.ecmaVersion >= 7 && code === 42 && next === 42) {
      ++size;
      tokentype = types$1.starstar;
      next = this.input.charCodeAt(this.pos + 2);
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, size + 1);
    }
    return this.finishOp(tokentype, size);
  };
  pp.readToken_pipe_amp = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (this.options.ecmaVersion >= 12) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 === 61) {
          return this.finishOp(types$1.assign, 3);
        }
      }
      return this.finishOp(code === 124 ? types$1.logicalOR : types$1.logicalAND, 2);
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(code === 124 ? types$1.bitwiseOR : types$1.bitwiseAND, 1);
  };
  pp.readToken_caret = function() {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(types$1.bitwiseXOR, 1);
  };
  pp.readToken_plus_min = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === code) {
      if (next === 45 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 62 && (this.lastTokEnd === 0 || lineBreak.test(this.input.slice(this.lastTokEnd, this.pos)))) {
        this.skipLineComment(3);
        this.skipSpace();
        return this.nextToken();
      }
      return this.finishOp(types$1.incDec, 2);
    }
    if (next === 61) {
      return this.finishOp(types$1.assign, 2);
    }
    return this.finishOp(types$1.plusMin, 1);
  };
  pp.readToken_lt_gt = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && this.input.charCodeAt(this.pos + 2) === 62 ? 3 : 2;
      if (this.input.charCodeAt(this.pos + size) === 61) {
        return this.finishOp(types$1.assign, size + 1);
      }
      return this.finishOp(types$1.bitShift, size);
    }
    if (next === 33 && code === 60 && !this.inModule && this.input.charCodeAt(this.pos + 2) === 45 && this.input.charCodeAt(this.pos + 3) === 45) {
      this.skipLineComment(4);
      this.skipSpace();
      return this.nextToken();
    }
    if (next === 61) {
      size = 2;
    }
    return this.finishOp(types$1.relational, size);
  };
  pp.readToken_eq_excl = function(code) {
    var next = this.input.charCodeAt(this.pos + 1);
    if (next === 61) {
      return this.finishOp(types$1.equality, this.input.charCodeAt(this.pos + 2) === 61 ? 3 : 2);
    }
    if (code === 61 && next === 62 && this.options.ecmaVersion >= 6) {
      this.pos += 2;
      return this.finishToken(types$1.arrow);
    }
    return this.finishOp(code === 61 ? types$1.eq : types$1.prefix, 1);
  };
  pp.readToken_question = function() {
    var ecmaVersion2 = this.options.ecmaVersion;
    if (ecmaVersion2 >= 11) {
      var next = this.input.charCodeAt(this.pos + 1);
      if (next === 46) {
        var next2 = this.input.charCodeAt(this.pos + 2);
        if (next2 < 48 || next2 > 57) {
          return this.finishOp(types$1.questionDot, 2);
        }
      }
      if (next === 63) {
        if (ecmaVersion2 >= 12) {
          var next2$1 = this.input.charCodeAt(this.pos + 2);
          if (next2$1 === 61) {
            return this.finishOp(types$1.assign, 3);
          }
        }
        return this.finishOp(types$1.coalesce, 2);
      }
    }
    return this.finishOp(types$1.question, 1);
  };
  pp.readToken_numberSign = function() {
    var ecmaVersion2 = this.options.ecmaVersion;
    var code = 35;
    if (ecmaVersion2 >= 13) {
      ++this.pos;
      code = this.fullCharCodeAtPos();
      if (isIdentifierStart(code, true) || code === 92) {
        return this.finishToken(types$1.privateId, this.readWord1());
      }
    }
    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };
  pp.getTokenFromCode = function(code) {
    switch (code) {
      // The interpretation of a dot depends on whether it is followed
      // by a digit or another two dots.
      case 46:
        return this.readToken_dot();
      // Punctuation tokens.
      case 40:
        ++this.pos;
        return this.finishToken(types$1.parenL);
      case 41:
        ++this.pos;
        return this.finishToken(types$1.parenR);
      case 59:
        ++this.pos;
        return this.finishToken(types$1.semi);
      case 44:
        ++this.pos;
        return this.finishToken(types$1.comma);
      case 91:
        ++this.pos;
        return this.finishToken(types$1.bracketL);
      case 93:
        ++this.pos;
        return this.finishToken(types$1.bracketR);
      case 123:
        ++this.pos;
        return this.finishToken(types$1.braceL);
      case 125:
        ++this.pos;
        return this.finishToken(types$1.braceR);
      case 58:
        ++this.pos;
        return this.finishToken(types$1.colon);
      case 96:
        if (this.options.ecmaVersion < 6) {
          break;
        }
        ++this.pos;
        return this.finishToken(types$1.backQuote);
      case 48:
        var next = this.input.charCodeAt(this.pos + 1);
        if (next === 120 || next === 88) {
          return this.readRadixNumber(16);
        }
        if (this.options.ecmaVersion >= 6) {
          if (next === 111 || next === 79) {
            return this.readRadixNumber(8);
          }
          if (next === 98 || next === 66) {
            return this.readRadixNumber(2);
          }
        }
      // Anything else beginning with a digit is an integer, octal
      // number, or float.
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        return this.readNumber(false);
      // Quotes produce strings.
      case 34:
      case 39:
        return this.readString(code);
      // Operators are parsed inline in tiny state machines. '=' (61) is
      // often referred to. `finishOp` simply skips the amount of
      // characters it is given as second argument, and returns a token
      // of the type given by its first argument.
      case 47:
        return this.readToken_slash();
      case 37:
      case 42:
        return this.readToken_mult_modulo_exp(code);
      case 124:
      case 38:
        return this.readToken_pipe_amp(code);
      case 94:
        return this.readToken_caret();
      case 43:
      case 45:
        return this.readToken_plus_min(code);
      case 60:
      case 62:
        return this.readToken_lt_gt(code);
      case 61:
      case 33:
        return this.readToken_eq_excl(code);
      case 63:
        return this.readToken_question();
      case 126:
        return this.finishOp(types$1.prefix, 1);
      case 35:
        return this.readToken_numberSign();
    }
    this.raise(this.pos, "Unexpected character '" + codePointToString(code) + "'");
  };
  pp.finishOp = function(type, size) {
    var str = this.input.slice(this.pos, this.pos + size);
    this.pos += size;
    return this.finishToken(type, str);
  };
  pp.readRegexp = function() {
    var escaped, inClass, start = this.pos;
    for (; ; ) {
      if (this.pos >= this.input.length) {
        this.raise(start, "Unterminated regular expression");
      }
      var ch = this.input.charAt(this.pos);
      if (lineBreak.test(ch)) {
        this.raise(start, "Unterminated regular expression");
      }
      if (!escaped) {
        if (ch === "[") {
          inClass = true;
        } else if (ch === "]" && inClass) {
          inClass = false;
        } else if (ch === "/" && !inClass) {
          break;
        }
        escaped = ch === "\\";
      } else {
        escaped = false;
      }
      ++this.pos;
    }
    var pattern = this.input.slice(start, this.pos);
    ++this.pos;
    var flagsStart = this.pos;
    var flags = this.readWord1();
    if (this.containsEsc) {
      this.unexpected(flagsStart);
    }
    var state = this.regexpState || (this.regexpState = new RegExpValidationState(this));
    state.reset(start, pattern, flags);
    this.validateRegExpFlags(state);
    this.validateRegExpPattern(state);
    var value = null;
    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
    }
    return this.finishToken(types$1.regexp, { pattern, flags, value });
  };
  pp.readInt = function(radix, len, maybeLegacyOctalNumericLiteral) {
    var allowSeparators = this.options.ecmaVersion >= 12 && len === void 0;
    var isLegacyOctalNumericLiteral = maybeLegacyOctalNumericLiteral && this.input.charCodeAt(this.pos) === 48;
    var start = this.pos, total = 0, lastCode = 0;
    for (var i2 = 0, e = len == null ? Infinity : len; i2 < e; ++i2, ++this.pos) {
      var code = this.input.charCodeAt(this.pos), val = void 0;
      if (allowSeparators && code === 95) {
        if (isLegacyOctalNumericLiteral) {
          this.raiseRecoverable(this.pos, "Numeric separator is not allowed in legacy octal numeric literals");
        }
        if (lastCode === 95) {
          this.raiseRecoverable(this.pos, "Numeric separator must be exactly one underscore");
        }
        if (i2 === 0) {
          this.raiseRecoverable(this.pos, "Numeric separator is not allowed at the first of digits");
        }
        lastCode = code;
        continue;
      }
      if (code >= 97) {
        val = code - 97 + 10;
      } else if (code >= 65) {
        val = code - 65 + 10;
      } else if (code >= 48 && code <= 57) {
        val = code - 48;
      } else {
        val = Infinity;
      }
      if (val >= radix) {
        break;
      }
      lastCode = code;
      total = total * radix + val;
    }
    if (allowSeparators && lastCode === 95) {
      this.raiseRecoverable(this.pos - 1, "Numeric separator is not allowed at the last of digits");
    }
    if (this.pos === start || len != null && this.pos - start !== len) {
      return null;
    }
    return total;
  };
  function stringToNumber(str, isLegacyOctalNumericLiteral) {
    if (isLegacyOctalNumericLiteral) {
      return parseInt(str, 8);
    }
    return parseFloat(str.replace(/_/g, ""));
  }
  function stringToBigInt(str) {
    if (typeof BigInt !== "function") {
      return null;
    }
    return BigInt(str.replace(/_/g, ""));
  }
  pp.readRadixNumber = function(radix) {
    var start = this.pos;
    this.pos += 2;
    var val = this.readInt(radix);
    if (val == null) {
      this.raise(this.start + 2, "Expected number in radix " + radix);
    }
    if (this.options.ecmaVersion >= 11 && this.input.charCodeAt(this.pos) === 110) {
      val = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
    } else if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }
    return this.finishToken(types$1.num, val);
  };
  pp.readNumber = function(startsWithDot) {
    var start = this.pos;
    if (!startsWithDot && this.readInt(10, void 0, true) === null) {
      this.raise(start, "Invalid number");
    }
    var octal = this.pos - start >= 2 && this.input.charCodeAt(start) === 48;
    if (octal && this.strict) {
      this.raise(start, "Invalid number");
    }
    var next = this.input.charCodeAt(this.pos);
    if (!octal && !startsWithDot && this.options.ecmaVersion >= 11 && next === 110) {
      var val$1 = stringToBigInt(this.input.slice(start, this.pos));
      ++this.pos;
      if (isIdentifierStart(this.fullCharCodeAtPos())) {
        this.raise(this.pos, "Identifier directly after number");
      }
      return this.finishToken(types$1.num, val$1);
    }
    if (octal && /[89]/.test(this.input.slice(start, this.pos))) {
      octal = false;
    }
    if (next === 46 && !octal) {
      ++this.pos;
      this.readInt(10);
      next = this.input.charCodeAt(this.pos);
    }
    if ((next === 69 || next === 101) && !octal) {
      next = this.input.charCodeAt(++this.pos);
      if (next === 43 || next === 45) {
        ++this.pos;
      }
      if (this.readInt(10) === null) {
        this.raise(start, "Invalid number");
      }
    }
    if (isIdentifierStart(this.fullCharCodeAtPos())) {
      this.raise(this.pos, "Identifier directly after number");
    }
    var val = stringToNumber(this.input.slice(start, this.pos), octal);
    return this.finishToken(types$1.num, val);
  };
  pp.readCodePoint = function() {
    var ch = this.input.charCodeAt(this.pos), code;
    if (ch === 123) {
      if (this.options.ecmaVersion < 6) {
        this.unexpected();
      }
      var codePos = ++this.pos;
      code = this.readHexChar(this.input.indexOf("}", this.pos) - this.pos);
      ++this.pos;
      if (code > 1114111) {
        this.invalidStringToken(codePos, "Code point out of bounds");
      }
    } else {
      code = this.readHexChar(4);
    }
    return code;
  };
  pp.readString = function(quote) {
    var out = "", chunkStart = ++this.pos;
    for (; ; ) {
      if (this.pos >= this.input.length) {
        this.raise(this.start, "Unterminated string constant");
      }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === quote) {
        break;
      }
      if (ch === 92) {
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(false);
        chunkStart = this.pos;
      } else if (ch === 8232 || ch === 8233) {
        if (this.options.ecmaVersion < 10) {
          this.raise(this.start, "Unterminated string constant");
        }
        ++this.pos;
        if (this.options.locations) {
          this.curLine++;
          this.lineStart = this.pos;
        }
      } else {
        if (isNewLine(ch)) {
          this.raise(this.start, "Unterminated string constant");
        }
        ++this.pos;
      }
    }
    out += this.input.slice(chunkStart, this.pos++);
    return this.finishToken(types$1.string, out);
  };
  var INVALID_TEMPLATE_ESCAPE_ERROR = {};
  pp.tryReadTemplateToken = function() {
    this.inTemplateElement = true;
    try {
      this.readTmplToken();
    } catch (err) {
      if (err === INVALID_TEMPLATE_ESCAPE_ERROR) {
        this.readInvalidTemplateToken();
      } else {
        throw err;
      }
    }
    this.inTemplateElement = false;
  };
  pp.invalidStringToken = function(position, message) {
    if (this.inTemplateElement && this.options.ecmaVersion >= 9) {
      throw INVALID_TEMPLATE_ESCAPE_ERROR;
    } else {
      this.raise(position, message);
    }
  };
  pp.readTmplToken = function() {
    var out = "", chunkStart = this.pos;
    for (; ; ) {
      if (this.pos >= this.input.length) {
        this.raise(this.start, "Unterminated template");
      }
      var ch = this.input.charCodeAt(this.pos);
      if (ch === 96 || ch === 36 && this.input.charCodeAt(this.pos + 1) === 123) {
        if (this.pos === this.start && (this.type === types$1.template || this.type === types$1.invalidTemplate)) {
          if (ch === 36) {
            this.pos += 2;
            return this.finishToken(types$1.dollarBraceL);
          } else {
            ++this.pos;
            return this.finishToken(types$1.backQuote);
          }
        }
        out += this.input.slice(chunkStart, this.pos);
        return this.finishToken(types$1.template, out);
      }
      if (ch === 92) {
        out += this.input.slice(chunkStart, this.pos);
        out += this.readEscapedChar(true);
        chunkStart = this.pos;
      } else if (isNewLine(ch)) {
        out += this.input.slice(chunkStart, this.pos);
        ++this.pos;
        switch (ch) {
          case 13:
            if (this.input.charCodeAt(this.pos) === 10) {
              ++this.pos;
            }
          case 10:
            out += "\n";
            break;
          default:
            out += String.fromCharCode(ch);
            break;
        }
        if (this.options.locations) {
          ++this.curLine;
          this.lineStart = this.pos;
        }
        chunkStart = this.pos;
      } else {
        ++this.pos;
      }
    }
  };
  pp.readInvalidTemplateToken = function() {
    for (; this.pos < this.input.length; this.pos++) {
      switch (this.input[this.pos]) {
        case "\\":
          ++this.pos;
          break;
        case "$":
          if (this.input[this.pos + 1] !== "{") {
            break;
          }
        // fall through
        case "`":
          return this.finishToken(types$1.invalidTemplate, this.input.slice(this.start, this.pos));
        case "\r":
          if (this.input[this.pos + 1] === "\n") {
            ++this.pos;
          }
        // fall through
        case "\n":
        case "\u2028":
        case "\u2029":
          ++this.curLine;
          this.lineStart = this.pos + 1;
          break;
      }
    }
    this.raise(this.start, "Unterminated template");
  };
  pp.readEscapedChar = function(inTemplate) {
    var ch = this.input.charCodeAt(++this.pos);
    ++this.pos;
    switch (ch) {
      case 110:
        return "\n";
      // 'n' -> '\n'
      case 114:
        return "\r";
      // 'r' -> '\r'
      case 120:
        return String.fromCharCode(this.readHexChar(2));
      // 'x'
      case 117:
        return codePointToString(this.readCodePoint());
      // 'u'
      case 116:
        return "	";
      // 't' -> '\t'
      case 98:
        return "\b";
      // 'b' -> '\b'
      case 118:
        return "\v";
      // 'v' -> '\u000b'
      case 102:
        return "\f";
      // 'f' -> '\f'
      case 13:
        if (this.input.charCodeAt(this.pos) === 10) {
          ++this.pos;
        }
      // '\r\n'
      case 10:
        if (this.options.locations) {
          this.lineStart = this.pos;
          ++this.curLine;
        }
        return "";
      case 56:
      case 57:
        if (this.strict) {
          this.invalidStringToken(
            this.pos - 1,
            "Invalid escape sequence"
          );
        }
        if (inTemplate) {
          var codePos = this.pos - 1;
          this.invalidStringToken(
            codePos,
            "Invalid escape sequence in template string"
          );
        }
      default:
        if (ch >= 48 && ch <= 55) {
          var octalStr = this.input.substr(this.pos - 1, 3).match(/^[0-7]+/)[0];
          var octal = parseInt(octalStr, 8);
          if (octal > 255) {
            octalStr = octalStr.slice(0, -1);
            octal = parseInt(octalStr, 8);
          }
          this.pos += octalStr.length - 1;
          ch = this.input.charCodeAt(this.pos);
          if ((octalStr !== "0" || ch === 56 || ch === 57) && (this.strict || inTemplate)) {
            this.invalidStringToken(
              this.pos - 1 - octalStr.length,
              inTemplate ? "Octal literal in template string" : "Octal literal in strict mode"
            );
          }
          return String.fromCharCode(octal);
        }
        if (isNewLine(ch)) {
          if (this.options.locations) {
            this.lineStart = this.pos;
            ++this.curLine;
          }
          return "";
        }
        return String.fromCharCode(ch);
    }
  };
  pp.readHexChar = function(len) {
    var codePos = this.pos;
    var n = this.readInt(16, len);
    if (n === null) {
      this.invalidStringToken(codePos, "Bad character escape sequence");
    }
    return n;
  };
  pp.readWord1 = function() {
    this.containsEsc = false;
    var word = "", first = true, chunkStart = this.pos;
    var astral = this.options.ecmaVersion >= 6;
    while (this.pos < this.input.length) {
      var ch = this.fullCharCodeAtPos();
      if (isIdentifierChar(ch, astral)) {
        this.pos += ch <= 65535 ? 1 : 2;
      } else if (ch === 92) {
        this.containsEsc = true;
        word += this.input.slice(chunkStart, this.pos);
        var escStart = this.pos;
        if (this.input.charCodeAt(++this.pos) !== 117) {
          this.invalidStringToken(this.pos, "Expecting Unicode escape sequence \\uXXXX");
        }
        ++this.pos;
        var esc = this.readCodePoint();
        if (!(first ? isIdentifierStart : isIdentifierChar)(esc, astral)) {
          this.invalidStringToken(escStart, "Invalid Unicode escape");
        }
        word += codePointToString(esc);
        chunkStart = this.pos;
      } else {
        break;
      }
      first = false;
    }
    return word + this.input.slice(chunkStart, this.pos);
  };
  pp.readWord = function() {
    var word = this.readWord1();
    var type = types$1.name;
    if (this.keywords.test(word)) {
      type = keywords[word];
    }
    return this.finishToken(type, word);
  };
  var version = "8.15.0";
  Parser.acorn = {
    Parser,
    version,
    defaultOptions,
    Position,
    SourceLocation,
    getLineInfo,
    Node,
    TokenType,
    tokTypes: types$1,
    keywordTypes: keywords,
    TokContext,
    tokContexts: types,
    isIdentifierChar,
    isIdentifierStart,
    Token,
    isNewLine,
    lineBreak,
    lineBreakG,
    nonASCIIwhitespace
  };
  class ShaderExprError extends Error {
    constructor(message, source, position = null) {
      super(message);
      this.name = "ShaderExprError";
      this.source = source;
      this.position = position;
    }
    toString() {
      let msg = `${this.name}: ${this.message}`;
      if (this.source) {
        msg += `
  Expression: "${this.source}"`;
      }
      if (this.position !== null) {
        msg += `
  Position: ${this.position}`;
      }
      return msg;
    }
  }
  function validateAST(ast, source) {
    const disallowed = [
      "FunctionDeclaration",
      "FunctionExpression",
      "ArrowFunctionExpression",
      "ClassDeclaration",
      "ClassExpression",
      "AwaitExpression",
      "ImportExpression",
      "AssignmentExpression",
      "UpdateExpression",
      "BlockStatement",
      "VariableDeclaration",
      "ForStatement",
      "WhileStatement",
      "DoWhileStatement",
      "IfStatement",
      "SwitchStatement",
      "TryStatement",
      "ThrowStatement"
    ];
    function check(node) {
      if (!node || typeof node !== "object") return;
      if (disallowed.includes(node.type)) {
        throw new ShaderExprError(
          `${node.type} not allowed in shader expressions. Use pure expressions only.`,
          source,
          node.start
        );
      }
      if (node.type === "MemberExpression" && node.computed) {
        const prop = node.property;
        if (prop.type !== "Literal" || typeof prop.value !== "number") {
          throw new ShaderExprError(
            "Dynamic array access not allowed in shader expressions. Use fixed indices only.",
            source,
            node.start
          );
        }
      }
      for (const key in node) {
        if (key === "type" || key === "start" || key === "end") continue;
        const child = node[key];
        if (Array.isArray(child)) {
          child.forEach(check);
        } else if (child && typeof child === "object") {
          check(child);
        }
      }
    }
    check(ast);
  }
  function parseExpression(exprString) {
    const cleaned = exprString.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
    if (!cleaned) {
      throw new ShaderExprError("Empty shader expression", exprString);
    }
    const wrapped = `(${cleaned})`;
    let ast;
    try {
      ast = Parser.parse(wrapped, {
        ecmaVersion: "latest",
        allowReserved: true
      });
    } catch (err) {
      throw new ShaderExprError(
        `Parse error: ${err.message}`,
        exprString,
        err.pos ? err.pos - 1 : null
        // adjust for our wrapping parenthesis
      );
    }
    if (!ast.body || !ast.body[0] || ast.body[0].type !== "ExpressionStatement") {
      throw new ShaderExprError("Expected an expression", exprString);
    }
    const expr = ast.body[0].expression;
    validateAST(expr, exprString);
    return expr;
  }
  let ForInStatement, FunctionDeclaration, RestElement, BinaryExpression, ArrayExpression, Block$1, MethodDefinition;
  const ignore = Function.prototype;
  class Found {
    constructor(node, state) {
      this.node = node;
      this.state = state;
    }
  }
  const defaultTraveler = {
    go(node, state) {
      if (this[node.type]) {
        this[node.type](node, state);
      }
    },
    find(predicate, node, state) {
      const finder = Object.create(this);
      finder.go = function(node2, state2) {
        if (predicate(node2, state2)) {
          throw new Found(node2, state2);
        }
        this[node2.type](node2, state2);
      };
      try {
        finder.go(node, state);
      } catch (error) {
        if (error instanceof Found) {
          return error;
        } else {
          throw error;
        }
      }
    },
    makeChild(properties = {}) {
      const traveler = Object.create(this);
      traveler.super = this;
      for (let key in properties) {
        traveler[key] = properties[key];
      }
      return traveler;
    },
    Program: Block$1 = function(node, state) {
      const {
        body
      } = node;
      if (body != null) {
        const {
          length
        } = body;
        for (let i2 = 0; i2 < length; i2++) {
          this.go(body[i2], state);
        }
      }
    },
    BlockStatement: Block$1,
    StaticBlock: Block$1,
    EmptyStatement: ignore,
    ExpressionStatement(node, state) {
      this.go(node.expression, state);
    },
    IfStatement(node, state) {
      this.go(node.test, state);
      this.go(node.consequent, state);
      if (node.alternate != null) {
        this.go(node.alternate, state);
      }
    },
    LabeledStatement(node, state) {
      this.go(node.label, state);
      this.go(node.body, state);
    },
    BreakStatement(node, state) {
      if (node.label) {
        this.go(node.label, state);
      }
    },
    ContinueStatement(node, state) {
      if (node.label) {
        this.go(node.label, state);
      }
    },
    WithStatement(node, state) {
      this.go(node.object, state);
      this.go(node.body, state);
    },
    SwitchStatement(node, state) {
      this.go(node.discriminant, state);
      const {
        cases
      } = node, {
        length
      } = cases;
      for (let i2 = 0; i2 < length; i2++) {
        this.go(cases[i2], state);
      }
    },
    SwitchCase(node, state) {
      if (node.test != null) {
        this.go(node.test, state);
      }
      const statements = node.consequent, {
        length
      } = statements;
      for (let i2 = 0; i2 < length; i2++) {
        this.go(statements[i2], state);
      }
    },
    ReturnStatement(node, state) {
      if (node.argument) {
        this.go(node.argument, state);
      }
    },
    ThrowStatement(node, state) {
      this.go(node.argument, state);
    },
    TryStatement(node, state) {
      this.go(node.block, state);
      if (node.handler != null) {
        this.go(node.handler, state);
      }
      if (node.finalizer != null) {
        this.go(node.finalizer, state);
      }
    },
    CatchClause(node, state) {
      if (node.param != null) {
        this.go(node.param, state);
      }
      this.go(node.body, state);
    },
    WhileStatement(node, state) {
      this.go(node.test, state);
      this.go(node.body, state);
    },
    DoWhileStatement(node, state) {
      this.go(node.body, state);
      this.go(node.test, state);
    },
    ForStatement(node, state) {
      if (node.init != null) {
        this.go(node.init, state);
      }
      if (node.test != null) {
        this.go(node.test, state);
      }
      if (node.update != null) {
        this.go(node.update, state);
      }
      this.go(node.body, state);
    },
    ForInStatement: ForInStatement = function(node, state) {
      this.go(node.left, state);
      this.go(node.right, state);
      this.go(node.body, state);
    },
    DebuggerStatement: ignore,
    FunctionDeclaration: FunctionDeclaration = function(node, state) {
      if (node.id != null) {
        this.go(node.id, state);
      }
      const {
        params
      } = node;
      if (params != null) {
        for (let i2 = 0, {
          length
        } = params; i2 < length; i2++) {
          this.go(params[i2], state);
        }
      }
      this.go(node.body, state);
    },
    VariableDeclaration(node, state) {
      const {
        declarations
      } = node, {
        length
      } = declarations;
      for (let i2 = 0; i2 < length; i2++) {
        this.go(declarations[i2], state);
      }
    },
    VariableDeclarator(node, state) {
      this.go(node.id, state);
      if (node.init != null) {
        this.go(node.init, state);
      }
    },
    ArrowFunctionExpression(node, state) {
      const {
        params
      } = node;
      if (params != null) {
        for (let i2 = 0, {
          length
        } = params; i2 < length; i2++) {
          this.go(params[i2], state);
        }
      }
      this.go(node.body, state);
    },
    ThisExpression: ignore,
    ArrayExpression: ArrayExpression = function(node, state) {
      const {
        elements
      } = node, {
        length
      } = elements;
      for (let i2 = 0; i2 < length; i2++) {
        let element = elements[i2];
        if (element != null) {
          this.go(elements[i2], state);
        }
      }
    },
    ObjectExpression(node, state) {
      const {
        properties
      } = node, {
        length
      } = properties;
      for (let i2 = 0; i2 < length; i2++) {
        this.go(properties[i2], state);
      }
    },
    Property(node, state) {
      this.go(node.key, state);
      if (node.value != null) {
        this.go(node.value, state);
      }
    },
    FunctionExpression: FunctionDeclaration,
    SequenceExpression(node, state) {
      const {
        expressions
      } = node, {
        length
      } = expressions;
      for (let i2 = 0; i2 < length; i2++) {
        this.go(expressions[i2], state);
      }
    },
    UnaryExpression(node, state) {
      this.go(node.argument, state);
    },
    UpdateExpression(node, state) {
      this.go(node.argument, state);
    },
    AssignmentExpression(node, state) {
      this.go(node.left, state);
      this.go(node.right, state);
    },
    BinaryExpression: BinaryExpression = function(node, state) {
      this.go(node.left, state);
      this.go(node.right, state);
    },
    LogicalExpression: BinaryExpression,
    ConditionalExpression(node, state) {
      this.go(node.test, state);
      this.go(node.consequent, state);
      this.go(node.alternate, state);
    },
    NewExpression(node, state) {
      this.CallExpression(node, state);
    },
    CallExpression(node, state) {
      this.go(node.callee, state);
      const args = node["arguments"], {
        length
      } = args;
      for (let i2 = 0; i2 < length; i2++) {
        this.go(args[i2], state);
      }
    },
    MemberExpression(node, state) {
      this.go(node.object, state);
      this.go(node.property, state);
    },
    Identifier: ignore,
    PrivateIdentifier: ignore,
    Literal: ignore,
    ForOfStatement: ForInStatement,
    ClassDeclaration(node, state) {
      if (node.id) {
        this.go(node.id, state);
      }
      if (node.superClass) {
        this.go(node.superClass, state);
      }
      this.go(node.body, state);
    },
    ClassBody: Block$1,
    ImportDeclaration(node, state) {
      const {
        specifiers
      } = node, {
        length
      } = specifiers;
      for (let i2 = 0; i2 < length; i2++) {
        this.go(specifiers[i2], state);
      }
      this.go(node.source, state);
    },
    ImportNamespaceSpecifier(node, state) {
      this.go(node.local, state);
    },
    ImportDefaultSpecifier(node, state) {
      this.go(node.local, state);
    },
    ImportSpecifier(node, state) {
      this.go(node.imported, state);
      this.go(node.local, state);
    },
    ExportDefaultDeclaration(node, state) {
      this.go(node.declaration, state);
    },
    ExportNamedDeclaration(node, state) {
      if (node.declaration) {
        this.go(node.declaration, state);
      }
      const {
        specifiers
      } = node, {
        length
      } = specifiers;
      for (let i2 = 0; i2 < length; i2++) {
        this.go(specifiers[i2], state);
      }
      if (node.source) {
        this.go(node.source, state);
      }
    },
    ExportSpecifier(node, state) {
      this.go(node.local, state);
      this.go(node.exported, state);
    },
    ExportAllDeclaration(node, state) {
      this.go(node.source, state);
    },
    MethodDefinition: MethodDefinition = function(node, state) {
      this.go(node.key, state);
      this.go(node.value, state);
    },
    PropertyDefinition: MethodDefinition,
    ClassExpression(node, state) {
      this.ClassDeclaration(node, state);
    },
    Super: ignore,
    RestElement: RestElement = function(node, state) {
      this.go(node.argument, state);
    },
    SpreadElement: RestElement,
    YieldExpression(node, state) {
      if (node.argument) {
        this.go(node.argument, state);
      }
    },
    TaggedTemplateExpression(node, state) {
      this.go(node.tag, state);
      this.go(node.quasi, state);
    },
    TemplateLiteral(node, state) {
      const {
        quasis,
        expressions
      } = node;
      for (let i2 = 0, {
        length
      } = expressions; i2 < length; i2++) {
        this.go(expressions[i2], state);
      }
      for (let i2 = 0, {
        length
      } = quasis; i2 < length; i2++) {
        this.go(quasis[i2], state);
      }
    },
    TemplateElement: ignore,
    ObjectPattern(node, state) {
      const {
        properties
      } = node, {
        length
      } = properties;
      for (let i2 = 0; i2 < length; i2++) {
        this.go(properties[i2], state);
      }
    },
    ArrayPattern: ArrayExpression,
    AssignmentPattern(node, state) {
      this.go(node.left, state);
      this.go(node.right, state);
    },
    MetaProperty(node, state) {
      this.go(node.meta, state);
      this.go(node.property, state);
    },
    AwaitExpression(node, state) {
      this.go(node.argument, state);
    }
  };
  function attachCommentsToNode(traveler, state, parent, children, findHeadingComments) {
    let {
      index
    } = state;
    const {
      comments
    } = state;
    let comment = comments[index];
    let boundComments, trailingComments;
    if (comment == null) {
      return;
    }
    if (children == null || children.length === 0) {
      boundComments = parent.comments != null ? parent.comments : [];
      while (comment != null && comment.end <= parent.end) {
        boundComments.push(comment);
        comment = comments[++index];
      }
      state.index = index;
      if (boundComments.length !== 0 && parent.comments == null) {
        parent.comments = boundComments;
      }
      return;
    }
    if (findHeadingComments) {
      boundComments = parent.comments != null ? parent.comments : [];
      const {
        start
      } = children[0];
      while (comment != null && (comment.type[0] === "B" || comment.type[0] === "M") && comment.end <= start) {
        boundComments.push(comment);
        comment = comments[++index];
      }
      if (boundComments.length !== 0 && parent.comments == null) parent.comments = boundComments;
    }
    for (let i2 = 0, {
      length
    } = children; comment != null && i2 < length; i2++) {
      const child = children[i2];
      boundComments = [];
      while (comment != null && comment.end <= child.start) {
        boundComments.push(comment);
        comment = comments[++index];
      }
      if (comment != null && comment.loc != null && (comment.type[0] === "L" || comment.type[0] === "S")) {
        if (comment.loc.start.line === child.loc.end.line) {
          boundComments.push(comment);
          comment = comments[++index];
        }
      }
      if (boundComments.length !== 0) {
        child.comments = boundComments;
      }
      state.index = index;
      traveler[child.type](child, state);
      index = state.index;
      comment = comments[index];
    }
    trailingComments = [];
    while (comment != null && comment.end <= parent.end) {
      trailingComments.push(comment);
      comment = comments[++index];
    }
    if (trailingComments.length !== 0) {
      parent.trailingComments = trailingComments;
    }
    state.index = index;
  }
  function Block(node, state) {
    attachCommentsToNode(this, state, node, node.body, true);
  }
  defaultTraveler.makeChild({
    Program: Block,
    BlockStatement: Block,
    ClassBody: Block,
    ObjectExpression(node, state) {
      attachCommentsToNode(this, state, node, node.properties, true);
    },
    ArrayExpression(node, state) {
      attachCommentsToNode(this, state, node, node.elements, true);
    },
    SwitchStatement(node, state) {
      attachCommentsToNode(this, state, node, node.cases, false);
    },
    SwitchCase(node, state) {
      attachCommentsToNode(this, state, node, node.consequent, false);
    }
  });
  function makeTraveler(properties) {
    return defaultTraveler.makeChild(properties);
  }
  const RESERVED_VARS = {
    // Fragment-level (per-pixel)
    "_st": { level: "fragment", glsl: "st", wgsl: "st" },
    "_c0": { level: "fragment", glsl: "_c0", wgsl: "_c0" },
    // Instance-level (per-instance, same for all vertices of an instance) - requires vertex extension with GPU instancing
    // In WGSL, _ix is defined as a local variable in both vertex and fragment shaders
    "_ix": { level: "instance", glsl: "v_instanceId", wgsl: "_ix" },
    // Instance position offset (vec3) - the position from instances()/grid()/scatter()
    "instanceOffset": { level: "instance", glsl: "instanceOffset", wgsl: "input.instanceOffset" },
    // Vertex-level (interpolated to fragment) - requires vertex extension
    // In WGSL, varyings are accessed via ourIn parameter (ourIn.v_normal, etc.)
    "_v": { level: "vertex", glsl: "v_", wgsl: "ourIn.v_", isPrefix: true },
    // Uniform-level (per-frame, available everywhere)
    // These are direct uniforms in group(0), not in the uf struct
    "time": { level: "uniform", glsl: "time", wgsl: "time" },
    "resolution": { level: "uniform", glsl: "resolution", wgsl: "resolution" },
    "mouse": { level: "uniform", glsl: "mouse", wgsl: "mouse" }
  };
  const VERTEX_VARYINGS = {
    "position": "v_position",
    "normal": "v_normal",
    "worldNormal": "v_worldNormal",
    "tangent": "v_tangent",
    "bitangent": "v_bitangent",
    "viewDir": "v_viewDir",
    "depth": "v_depth",
    "uv": "uv",
    "faceId": "v_faceId",
    "color": "v_color",
    "instanceId": "v_instanceId"
  };
  const LEVEL_PRIORITY = {
    "uniform": 0,
    // runs once per frame
    "instance": 1,
    // runs per instance (GPU instancing)
    "vertex": 2,
    // runs per vertex, interpolated to fragment
    "fragment": 3
    // runs per pixel
  };
  const MATH_FUNCTIONS = /* @__PURE__ */ new Set([
    "sin",
    "cos",
    "tan",
    "asin",
    "acos",
    "atan",
    "sinh",
    "cosh",
    "tanh",
    "pow",
    "exp",
    "exp2",
    "log",
    "log2",
    "sqrt",
    "inversesqrt",
    "abs",
    "sign",
    "floor",
    "ceil",
    "fract",
    "mod",
    "min",
    "max",
    "clamp",
    "mix",
    "step",
    "smoothstep",
    "length",
    "distance",
    "dot",
    "cross",
    "normalize",
    "radians",
    "degrees"
  ]);
  const VECTOR_CONSTRUCTORS = /* @__PURE__ */ new Set([
    "vec2",
    "vec3",
    "vec4",
    "ivec2",
    "ivec3",
    "ivec4",
    "mat2",
    "mat3",
    "mat4"
  ]);
  const WGSL_VECTOR_CONSTRUCTORS = {
    "vec2": "vec2f",
    "vec3": "vec3f",
    "vec4": "vec4f",
    "ivec2": "vec2i",
    "ivec3": "vec3i",
    "ivec4": "vec4i",
    "mat2": "mat2x2f",
    "mat3": "mat3x3f",
    "mat4": "mat4x4f"
  };
  function scanExpression(ast, source) {
    const foundVars = /* @__PURE__ */ new Set();
    const unknownVars = [];
    let maxLevel = "uniform";
    const traveler = makeTraveler({
      go: function(node, state) {
        if (node.type === "Identifier") {
          const name = node.name;
          if (RESERVED_VARS[name]) {
            foundVars.add(name);
            const varLevel = RESERVED_VARS[name].level;
            if (LEVEL_PRIORITY[varLevel] > LEVEL_PRIORITY[maxLevel]) {
              maxLevel = varLevel;
            }
          } else if (MATH_FUNCTIONS.has(name) || VECTOR_CONSTRUCTORS.has(name)) ;
          else if (name === "Math") ;
          else if (!state.inCall && !state.inMember) {
            unknownVars.push({ name, start: node.start });
          }
        }
        if (node.type === "MemberExpression") {
          if (node.object.type === "Identifier" && node.object.name === "_v") {
            const propName = node.property.name || node.property.value;
            if (VERTEX_VARYINGS[propName]) {
              foundVars.add(`_v.${propName}`);
              if (LEVEL_PRIORITY["vertex"] > LEVEL_PRIORITY[maxLevel]) {
                maxLevel = "vertex";
              }
            } else {
              throw new ShaderExprError(
                `Unknown vertex varying '_v.${propName}'. Available: ${Object.keys(VERTEX_VARYINGS).join(", ")}`,
                source,
                node.start
              );
            }
          }
          if (node.object.type === "Identifier" && node.object.name === "Math") {
            foundVars.add(`Math.${node.property.name}`);
          }
        }
        const prevInCall = state.inCall;
        const prevInMember = state.inMember;
        if (node.type === "CallExpression") {
          state.inCall = true;
        }
        if (node.type === "MemberExpression") {
          state.inMember = true;
        }
        this.super.go.call(this, node, state);
        state.inCall = prevInCall;
        state.inMember = prevInMember;
      }
    });
    traveler.go(ast, { inCall: false, inMember: false });
    if (unknownVars.length > 0) {
      const unknown = unknownVars[0];
      let suggestion = "";
      if (unknown.name === "st") suggestion = " Did you mean '_st'?";
      if (unknown.name === "uv") suggestion = " Did you mean '_st' or '_v.uv'?";
      if (unknown.name === "c0") suggestion = " Did you mean '_c0'?";
      if (unknown.name === "v") suggestion = " Did you mean '_v.position', '_v.normal', etc?";
      if (unknown.name === "ix" || unknown.name === "i") suggestion = " Did you mean '_ix' (instance index)?";
      throw new ShaderExprError(
        `Unknown variable '${unknown.name}'.${suggestion} Shader expressions can reference: _st, _c0, _v.*, _ix, time, resolution, mouse`,
        source,
        unknown.start
      );
    }
    return { foundVars, level: maxLevel };
  }
  const MATH_CONSTANTS$1 = {
    "PI": "3.14159265358979",
    "E": "2.71828182845905",
    "LN2": "0.693147180559945",
    "LN10": "2.302585092994046",
    "LOG2E": "1.4426950408889634",
    "LOG10E": "0.4342944819032518",
    "SQRT2": "1.4142135623730951",
    "SQRT1_2": "0.7071067811865476"
  };
  function ensureFloat$1(value) {
    const s = value.toString();
    if (s.includes(".") || s.includes("e") || s.includes("E")) {
      return s;
    }
    return s + ".0";
  }
  function emitGLSL(ast) {
    return emit$1(ast);
  }
  function emit$1(node) {
    switch (node.type) {
      case "Literal":
        if (typeof node.value === "number") {
          return ensureFloat$1(node.value);
        }
        if (typeof node.value === "boolean") {
          return node.value ? "true" : "false";
        }
        return String(node.value);
      case "Identifier": {
        const name = node.name;
        if (RESERVED_VARS[name]) {
          return RESERVED_VARS[name].glsl;
        }
        return name;
      }
      case "BinaryExpression":
      case "LogicalExpression": {
        const left = emit$1(node.left);
        const right = emit$1(node.right);
        let op = node.operator;
        if (op === "**") {
          return `pow(${left}, ${right})`;
        }
        return `(${left} ${op} ${right})`;
      }
      case "UnaryExpression":
        return `${node.operator}${emit$1(node.argument)}`;
      case "CallExpression": {
        const callee = emit$1(node.callee);
        const args = node.arguments.map(emit$1).join(", ");
        return `${callee}(${args})`;
      }
      case "MemberExpression": {
        if (node.object.type === "Identifier" && node.object.name === "_v") {
          const propName = node.property.name || node.property.value;
          const glslName = VERTEX_VARYINGS[propName];
          if (glslName) {
            return glslName;
          }
        }
        if (node.object.type === "Identifier" && node.object.name === "Math") {
          const prop2 = node.property.name;
          if (MATH_CONSTANTS$1[prop2]) {
            return MATH_CONSTANTS$1[prop2];
          }
          return prop2.toLowerCase();
        }
        const obj = emit$1(node.object);
        const prop = node.computed ? `[${emit$1(node.property)}]` : `.${node.property.name || node.property.value}`;
        return `${obj}${prop}`;
      }
      case "ConditionalExpression":
        return `(${emit$1(node.test)} ? ${emit$1(node.consequent)} : ${emit$1(node.alternate)})`;
      case "SequenceExpression":
        return node.expressions.map(emit$1).join(", ");
      case "ParenthesizedExpression":
        return `(${emit$1(node.expression)})`;
      default:
        throw new Error(`Unsupported AST node type in GLSL emitter: ${node.type}`);
    }
  }
  const MATH_CONSTANTS = {
    "PI": "3.14159265358979",
    "E": "2.71828182845905",
    "LN2": "0.693147180559945",
    "LN10": "2.302585092994046",
    "LOG2E": "1.4426950408889634",
    "LOG10E": "0.4342944819032518",
    "SQRT2": "1.4142135623730951",
    "SQRT1_2": "0.7071067811865476"
  };
  function ensureFloat(value) {
    const s = value.toString();
    if (s.includes(".") || s.includes("e") || s.includes("E")) {
      return s;
    }
    return s + ".0";
  }
  function emitWGSL(ast) {
    return emit(ast);
  }
  function emit(node) {
    switch (node.type) {
      case "Literal":
        if (typeof node.value === "number") {
          return ensureFloat(node.value);
        }
        if (typeof node.value === "boolean") {
          return node.value ? "true" : "false";
        }
        return String(node.value);
      case "Identifier": {
        const name = node.name;
        if (RESERVED_VARS[name]) {
          return RESERVED_VARS[name].wgsl;
        }
        if (WGSL_VECTOR_CONSTRUCTORS[name]) {
          return WGSL_VECTOR_CONSTRUCTORS[name];
        }
        return name;
      }
      case "BinaryExpression":
      case "LogicalExpression": {
        const left = emit(node.left);
        const right = emit(node.right);
        let op = node.operator;
        if (op === "**") {
          return `pow(${left}, ${right})`;
        }
        if (op === "%") {
          return `(${left} - ${right} * floor(${left} / ${right}))`;
        }
        return `(${left} ${op} ${right})`;
      }
      case "UnaryExpression":
        return `${node.operator}${emit(node.argument)}`;
      case "CallExpression": {
        const callee = emit(node.callee);
        const args = node.arguments.map(emit);
        if (callee === "mod" && args.length === 2) {
          return `(${args[0]} - ${args[1]} * floor(${args[0]} / ${args[1]}))`;
        }
        if (callee === "atan" && args.length === 2) {
          return `atan2(${args[0]}, ${args[1]})`;
        }
        return `${callee}(${args.join(", ")})`;
      }
      case "MemberExpression": {
        if (node.object.type === "Identifier" && node.object.name === "_v") {
          const propName = node.property.name || node.property.value;
          const glslName = VERTEX_VARYINGS[propName];
          if (glslName) {
            return `ourIn.${glslName}`;
          }
        }
        if (node.object.type === "Identifier" && node.object.name === "Math") {
          const prop2 = node.property.name;
          if (MATH_CONSTANTS[prop2]) {
            return MATH_CONSTANTS[prop2];
          }
          return prop2.toLowerCase();
        }
        const obj = emit(node.object);
        const prop = node.computed ? `[${emit(node.property)}]` : `.${node.property.name || node.property.value}`;
        return `${obj}${prop}`;
      }
      case "ConditionalExpression":
        return `select(${emit(node.alternate)}, ${emit(node.consequent)}, ${emit(node.test)})`;
      case "SequenceExpression":
        return node.expressions.map(emit).join(", ");
      case "ParenthesizedExpression":
        return `(${emit(node.expression)})`;
      default:
        throw new Error(`Unsupported AST node type in WGSL emitter: ${node.type}`);
    }
  }
  class ShaderExpression {
    constructor(exprString) {
      this.source = exprString;
      this.ast = parseExpression(exprString);
      const { foundVars, level } = scanExpression(this.ast, exprString);
      this.foundVars = foundVars;
      this.level = level;
      this._glslCache = null;
      this._wgslCache = null;
    }
    toGLSL() {
      if (this._glslCache === null) {
        this._glslCache = emitGLSL(this.ast);
      }
      return this._glslCache;
    }
    toWGSL() {
      if (this._wgslCache === null) {
        this._wgslCache = emitWGSL(this.ast);
      }
      return this._wgslCache;
    }
    // For compatibility with existing uniform system
    get isUniform() {
      return false;
    }
    toString() {
      return this.toGLSL();
    }
  }
  function looksLikeExpression(value) {
    if (typeof value !== "string") return false;
    return /[+\-*/%()<>?:]|_st|_c0|_v\.|_ix|time|resolution|mouse|sin|cos|pow|mix|vec[234]/.test(value);
  }
  function parseShaderExpr(value) {
    if (!looksLikeExpression(value)) {
      return null;
    }
    try {
      return new ShaderExpression(value);
    } catch (err) {
      if (err instanceof ShaderExprError) {
        throw err;
      }
      console.warn("Shader expression parsing failed:", err);
      return null;
    }
  }
  function makeUniformAccessor(value) {
    return (context, props) => {
      if (Array.isArray(value)) {
        return value.map((v2) => typeof v2 === "function" ? v2() : v2);
      }
      if (typeof value === "function") {
        return value();
      }
      return value;
    };
  }
  function getAngleGlsl(value, uniformName, uniforms, uniformDecls, suffix) {
    if (typeof value === "string") {
      const expr = parseShaderExpr(value);
      if (expr) {
        return expr.toGLSL();
      }
    }
    uniformDecls.push(`uniform float ${uniformName};`);
    uniforms[uniformName] = makeUniformAccessor(value);
    return uniformName;
  }
  class VertexSource {
    constructor(vertices) {
      this.vertices = vertices;
      this.transforms = [];
      this.instancePositions = null;
      this.instanceRotations = null;
      this.instanceScales = null;
      this.instanceCount = 0;
      Object.defineProperty(this, "instanceOffsets", {
        get: () => this.instancePositions,
        set: (v2) => {
          this.instancePositions = v2;
        }
      });
    }
    // Get raw vertices (for backward compat or direct access)
    get verts() {
      return this.vertices;
    }
    // Check if this has any transforms
    get hasTransforms() {
      return this.transforms.length > 0;
    }
    // Add a transform to the chain
    _addTransform(type, args) {
      this.transforms.push({ type, args });
      return this;
    }
    // Chainable transforms
    rotate(angle = 0) {
      return this._addTransform("rotate", { angle });
    }
    // 3D rotations
    rotateX(angle = 0) {
      return this._addTransform("rotateX", { angle });
    }
    rotateY(angle = 0) {
      return this._addTransform("rotateY", { angle });
    }
    rotateZ(angle = 0) {
      return this._addTransform("rotateZ", { angle });
    }
    scale(x = 1, y, z) {
      if (y === void 0) y = x;
      if (z === void 0) z = x;
      return this._addTransform("scale", { x, y, z });
    }
    offset(x = 0, y = 0, z = 0) {
      return this._addTransform("offset", { x, y, z });
    }
    // Alias for offset
    translate(x = 0, y = 0, z = 0) {
      return this.offset(x, y, z);
    }
    // Set perspective projection
    perspective(fov = 45, near = 0.1, far = 100) {
      return this._addTransform("perspective", { fov, near, far });
    }
    // ========== Immediate transforms (CPU, modify vertex array) ==========
    // Mirror geometry across an axis
    // axis: 'x', 'y', or 'xy' (both)
    mirror(axis = "x") {
      const orig = this.vertices;
      const mirrored = [];
      const stride = 2;
      for (let i2 = 0; i2 < orig.length; i2 += stride) {
        const x = orig[i2];
        const y = orig[i2 + 1];
        if (axis === "x" || axis === "xy") {
          mirrored.push(-x, y);
        }
        if (axis === "y") {
          mirrored.push(x, -y);
        }
      }
      if (axis === "xy") {
        for (let i2 = 0; i2 < orig.length; i2 += stride) {
          mirrored.push(orig[i2], -orig[i2 + 1]);
        }
        for (let i2 = 0; i2 < orig.length; i2 += stride) {
          mirrored.push(-orig[i2], -orig[i2 + 1]);
        }
      }
      this.vertices = [...orig, ...mirrored];
      return this;
    }
    // Repeat geometry in a grid pattern
    // nx, ny: number of copies in x and y directions
    // spacing: distance between copies (in NDC)
    repeat(nx = 2, ny = 1, spacing = 0.5) {
      const orig = this.vertices;
      const repeated = [];
      const stride = 2;
      const offsetX = -((nx - 1) * spacing) / 2;
      const offsetY = -((ny - 1) * spacing) / 2;
      for (let iy = 0; iy < ny; iy++) {
        for (let ix = 0; ix < nx; ix++) {
          const dx = offsetX + ix * spacing;
          const dy = offsetY + iy * spacing;
          for (let i2 = 0; i2 < orig.length; i2 += stride) {
            repeated.push(orig[i2] + dx, orig[i2 + 1] + dy);
          }
        }
      }
      this.vertices = repeated;
      return this;
    }
    // 3D grid instancing (GPU-accelerated)
    // Creates a grid of instances without duplicating vertices
    // nx, ny, nz: number of copies in each direction
    // spacing: distance between copies (or {x, y, z} object)
    grid(nx = 2, ny = 2, nz = 1, spacing = 1) {
      const sx = typeof spacing === "object" ? spacing.x || 1 : spacing;
      const sy = typeof spacing === "object" ? spacing.y || 1 : spacing;
      const sz = typeof spacing === "object" ? spacing.z || 1 : spacing;
      const count = nx * ny * nz;
      this.instanceOffsets = new Float32Array(count * 3);
      const offsetX = -((nx - 1) * sx) / 2;
      const offsetY = -((ny - 1) * sy) / 2;
      const offsetZ = -((nz - 1) * sz) / 2;
      let idx = 0;
      for (let iz = 0; iz < nz; iz++) {
        for (let iy = 0; iy < ny; iy++) {
          for (let ix = 0; ix < nx; ix++) {
            this.instanceOffsets[idx++] = offsetX + ix * sx;
            this.instanceOffsets[idx++] = offsetY + iy * sy;
            this.instanceOffsets[idx++] = offsetZ + iz * sz;
          }
        }
      }
      this.instanceCount = count;
      return this;
    }
    // Scatter instances randomly (GPU-accelerated)
    // Creates random instance offsets without duplicating vertices
    // count: number of instances
    // range: {x, y, z} spread range (centered at origin)
    // seed: optional random seed for reproducibility
    scatter(count = 10, range = { x: 2, y: 2, z: 0 }, seed = 0) {
      let s = seed;
      const random = () => {
        s = s * 1103515245 + 12345 & 2147483647;
        return s / 2147483647;
      };
      const rx = typeof range === "number" ? range : range.x || 2;
      const ry = typeof range === "number" ? range : range.y || 2;
      const rz = typeof range === "number" ? 0 : range.z || 0;
      this.instanceOffsets = new Float32Array(count * 3);
      let idx = 0;
      for (let i2 = 0; i2 < count; i2++) {
        this.instanceOffsets[idx++] = (random() - 0.5) * rx;
        this.instanceOffsets[idx++] = (random() - 0.5) * ry;
        this.instanceOffsets[idx++] = (random() - 0.5) * rz;
      }
      this.instanceCount = count;
      return this;
    }
    // Custom instance data (GPU-accelerated)
    // Accepts various formats:
    //   instances([[x,y,z], ...])  - positions only (nested)
    //   instances([x,y,z, x,y,z, ...])  - positions only (flat)
    //   instances({ positions: [...], rotations: [...], scales: [...] })  - full control
    //
    // Each array can be nested [[x,y,z], ...] or flat [x,y,z, ...]
    // Scales can also be scalar per instance [s0, s1, ...] for uniform scaling
    instances(data2) {
      const flatten = (arr, componentsPerItem) => {
        if (!arr) return null;
        if (arr instanceof Float32Array) return arr;
        if (typeof arr[0] === "number") {
          return new Float32Array(arr);
        }
        const count = arr.length;
        const flat = new Float32Array(count * componentsPerItem);
        for (let i2 = 0; i2 < count; i2++) {
          const item = arr[i2];
          if (Array.isArray(item)) {
            for (let j = 0; j < componentsPerItem; j++) {
              flat[i2 * componentsPerItem + j] = item[j] !== void 0 ? item[j] : j < 3 ? 0 : 1;
            }
          } else if (typeof item === "object") {
            flat[i2 * componentsPerItem] = item.x !== void 0 ? item.x : 0;
            flat[i2 * componentsPerItem + 1] = item.y !== void 0 ? item.y : 0;
            flat[i2 * componentsPerItem + 2] = item.z !== void 0 ? item.z : 0;
          } else {
            flat[i2 * componentsPerItem] = item;
            flat[i2 * componentsPerItem + 1] = item;
            flat[i2 * componentsPerItem + 2] = item;
          }
        }
        return flat;
      };
      if (Array.isArray(data2) || data2 instanceof Float32Array) {
        this.instancePositions = flatten(data2, 3);
        this.instanceCount = this.instancePositions.length / 3;
      } else if (typeof data2 === "object") {
        if (data2.positions) {
          this.instancePositions = flatten(data2.positions, 3);
          this.instanceCount = this.instancePositions.length / 3;
        }
        if (data2.rotations) {
          this.instanceRotations = flatten(data2.rotations, 3);
        }
        if (data2.scales) {
          const scales = data2.scales;
          if (typeof scales[0] === "number" && !Array.isArray(scales[0])) {
            if (scales.length === this.instanceCount) {
              const flat = new Float32Array(this.instanceCount * 3);
              for (let i2 = 0; i2 < this.instanceCount; i2++) {
                flat[i2 * 3] = flat[i2 * 3 + 1] = flat[i2 * 3 + 2] = scales[i2];
              }
              this.instanceScales = flat;
            } else {
              this.instanceScales = flatten(scales, 3);
            }
          } else {
            this.instanceScales = flatten(scales, 3);
          }
        }
      }
      return this;
    }
    // ========== Animation ==========
    // Animate a skinned model using embedded animation clips
    // clipName: name of animation clip (or uses first clip if not found)
    // timeFunc: function returning current time, e.g., () => time
    // Returns new VertexSource with animated vertices (called each frame)
    animate(clipName = null, timeFunc = () => 0) {
      if (!this.joints || !this.weights || !this._gltf) {
        console.warn("animate() called on model without skinning data");
        return this;
      }
      if (!this._skeleton) {
        this._skeleton = extractSkeleton(this._gltf, this._binBuffer);
        this._animations = extractAnimations(this._gltf, this._binBuffer);
        if (this._animations.length > 0) {
          console.log(
            `Loaded ${this._animations.length} animation(s):`,
            this._animations.map((a) => `${a.name} (${a.duration.toFixed(2)}s)`).join(", ")
          );
        }
      }
      if (!this._skeleton || this._animations.length === 0) {
        console.warn("Model has no skeleton or animations");
        return this;
      }
      const animated = new VertexSource([...this.vertices]);
      animated.is3D = this.is3D;
      animated.normals = this.normals ? [...this.normals] : null;
      animated.uvs = this.uvs ? [...this.uvs] : null;
      animated.tangents = this.tangents ? [...this.tangents] : null;
      animated.colors = this.colors ? [...this.colors] : null;
      animated.faceIds = this.faceIds ? [...this.faceIds] : null;
      animated.transforms = [...this.transforms];
      animated._animClip = clipName;
      animated._animTimeFunc = timeFunc;
      animated._skeleton = this._skeleton;
      animated._animations = this._animations;
      animated._gltf = this._gltf;
      animated._originalVerts = this.vertices;
      animated._originalNormals = this.normals;
      animated.joints = this.joints;
      animated.weights = this.weights;
      animated._normCenter = this._normCenter;
      animated._normScale = this._normScale;
      return animated;
    }
    // Get list of available animation clip names
    getAnimations() {
      if (!this._gltf) return [];
      if (!this._animations) {
        this._animations = extractAnimations(this._gltf, this._binBuffer);
      }
      return this._animations.map((a) => ({ name: a.name, duration: a.duration }));
    }
  }
  function generateVertexGlsl(vertexSource, precision, options = {}) {
    const {
      useExplicitUVs = false,
      useFaceIds = false,
      useNormals = false,
      useTangents = false,
      useColors = false,
      useInstancing = false,
      useInstanceRotation = false,
      useInstanceScale = false
    } = options;
    const uvAttributeDecl = useExplicitUVs ? "attribute vec2 texcoord;" : "";
    const uvComputation = useExplicitUVs ? "uv = texcoord;" : "uv = (position.xy - u_boundsMin) / (u_boundsMax - u_boundsMin);";
    const faceIdAttributeDecl = useFaceIds ? "attribute float faceId;" : "";
    const faceIdVaryingDecl = "varying float v_faceId;";
    const faceIdPassthrough = useFaceIds ? "v_faceId = faceId;" : "v_faceId = 0.0;";
    const normalAttributeDecl = useNormals ? "attribute vec3 normal;" : "";
    const tangentAttributeDecl = useTangents ? "attribute vec4 tangent;" : "";
    const colorAttributeDecl = useColors ? "attribute vec4 color;" : "";
    const colorPassthrough = useColors ? "v_color = color;" : "v_color = vec4(1.0, 1.0, 1.0, 1.0);";
    let instanceAttributeDecl = useInstancing ? "attribute vec3 instanceOffset;\nattribute float instanceId;" : "";
    if (useInstanceRotation) instanceAttributeDecl += "\nattribute vec3 instanceRotation;";
    if (useInstanceScale) instanceAttributeDecl += "\nattribute vec3 instanceScale;";
    const instanceIdVaryingDecl = "varying float v_instanceId;";
    const instanceIdPassthrough = useInstancing ? "v_instanceId = instanceId;" : "v_instanceId = 0.0;";
    const instanceOffsetCode = useInstancing ? "pos += instanceOffset;" : "";
    const instanceRotationCode = useInstanceRotation ? `
          // Per-instance rotation (euler XYZ)
          {
            float cx = cos(instanceRotation.x), sx = sin(instanceRotation.x);
            float cy = cos(instanceRotation.y), sy = sin(instanceRotation.y);
            float cz = cos(instanceRotation.z), sz = sin(instanceRotation.z);
            // Rotate X
            pos = vec3(pos.x, pos.y * cx - pos.z * sx, pos.y * sx + pos.z * cx);
            // Rotate Y
            pos = vec3(pos.x * cy + pos.z * sy, pos.y, -pos.x * sy + pos.z * cy);
            // Rotate Z
            pos = vec3(pos.x * cz - pos.y * sz, pos.x * sz + pos.y * cz, pos.z);
          }` : "";
    const instanceScaleCode = useInstanceScale ? "pos *= instanceScale;" : "";
    if (!vertexSource.hasTransforms) {
      return {
        glsl: `
        precision ${precision} float;
        attribute vec3 position;
        ${instanceAttributeDecl}
        ${uvAttributeDecl}
        ${faceIdAttributeDecl}
        ${colorAttributeDecl}
        varying vec2 uv;
        ${faceIdVaryingDecl}
        ${instanceIdVaryingDecl}

        // Vertex data for fragment shader (default values for 2D)
        varying vec3 v_position;
        varying vec3 v_normal;
        varying vec3 v_worldNormal;
        varying vec3 v_tangent;
        varying vec3 v_bitangent;
        varying vec3 v_viewDir;
        varying float v_depth;
        varying vec4 v_color;

        uniform vec2 u_boundsMin;
        uniform vec2 u_boundsMax;

        void main () {
          // UV ${useExplicitUVs ? "from explicit attribute" : "normalized to shape bounds"}
          ${uvComputation}
          ${faceIdPassthrough}
          ${colorPassthrough}
          ${instanceIdPassthrough}

          // Apply instance transforms if enabled
          vec3 pos = position;
          ${instanceScaleCode}
          ${instanceRotationCode}
          ${instanceOffsetCode}

          // Set default vertex data for 2D geometry
          v_position = pos;
          v_normal = vec3(0.0, 0.0, 1.0);
          v_worldNormal = vec3(0.0, 0.0, 1.0);
          v_tangent = vec3(1.0, 0.0, 0.0);
          v_bitangent = vec3(0.0, 1.0, 0.0);
          v_viewDir = vec3(0.0, 0.0, 1.0);
          v_depth = 1.0;

          gl_Position = vec4(pos.xy, 0.0, 1.0);
          gl_PointSize = 2.0;
        }
      `,
        uniforms: {}
      };
    }
    const uniforms = {};
    const uniformDecls = [];
    const transformCode = [];
    const normalTransformCode = [];
    const tangentTransformCode = [];
    const has3D = vertexSource.transforms.some(
      (t) => ["rotateX", "rotateY", "rotateZ", "perspective"].includes(t.type) || t.type === "offset" && t.args.z !== 0
    );
    let hasPerspective = false;
    let perspectiveUniform = null;
    vertexSource.transforms.forEach((transform, i2) => {
      const suffix = i2;
      switch (transform.type) {
        case "rotate": {
          const uniformName = `u_rotate_${suffix}`;
          const angleGlsl = getAngleGlsl(transform.args.angle, uniformName, uniforms, uniformDecls);
          if (has3D) {
            const rotateCode = `
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            pos = vec3(pos.x * c - pos.y * s, pos.x * s + pos.y * c, pos.z);
          }`;
            transformCode.push(rotateCode);
            normalTransformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            nrm = vec3(nrm.x * c - nrm.y * s, nrm.x * s + nrm.y * c, nrm.z);
          }`);
            tangentTransformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            tang = vec3(tang.x * c - tang.y * s, tang.x * s + tang.y * c, tang.z);
          }`);
          } else {
            transformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            pos = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c);
          }`);
          }
          break;
        }
        case "rotateX": {
          const uniformName = `u_rotateX_${suffix}`;
          const angleGlsl = getAngleGlsl(transform.args.angle, uniformName, uniforms, uniformDecls);
          transformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            pos = vec3(pos.x, pos.y * c - pos.z * s, pos.y * s + pos.z * c);
          }`);
          normalTransformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            nrm = vec3(nrm.x, nrm.y * c - nrm.z * s, nrm.y * s + nrm.z * c);
          }`);
          tangentTransformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            tang = vec3(tang.x, tang.y * c - tang.z * s, tang.y * s + tang.z * c);
          }`);
          break;
        }
        case "rotateY": {
          const uniformName = `u_rotateY_${suffix}`;
          const angleGlsl = getAngleGlsl(transform.args.angle, uniformName, uniforms, uniformDecls);
          transformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            pos = vec3(pos.x * c + pos.z * s, pos.y, -pos.x * s + pos.z * c);
          }`);
          normalTransformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            nrm = vec3(nrm.x * c + nrm.z * s, nrm.y, -nrm.x * s + nrm.z * c);
          }`);
          tangentTransformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            tang = vec3(tang.x * c + tang.z * s, tang.y, -tang.x * s + tang.z * c);
          }`);
          break;
        }
        case "rotateZ": {
          const uniformName = `u_rotateZ_${suffix}`;
          const angleGlsl = getAngleGlsl(transform.args.angle, uniformName, uniforms, uniformDecls);
          transformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            pos = vec3(pos.x * c - pos.y * s, pos.x * s + pos.y * c, pos.z);
          }`);
          normalTransformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            nrm = vec3(nrm.x * c - nrm.y * s, nrm.x * s + nrm.y * c, nrm.z);
          }`);
          tangentTransformCode.push(`
          {
            float c = cos(${angleGlsl});
            float s = sin(${angleGlsl});
            tang = vec3(tang.x * c - tang.y * s, tang.x * s + tang.y * c, tang.z);
          }`);
          break;
        }
        case "scale": {
          const getScaleGlsl = (val, name) => {
            if (typeof val === "string") {
              const expr = parseShaderExpr(val);
              if (expr) return expr.toGLSL();
            }
            uniformDecls.push(`uniform float ${name};`);
            uniforms[name] = makeUniformAccessor(val);
            return name;
          };
          const sx = getScaleGlsl(transform.args.x, `u_scaleX_${suffix}`);
          const sy = getScaleGlsl(transform.args.y, `u_scaleY_${suffix}`);
          if (has3D) {
            const sz = getScaleGlsl(transform.args.z ?? 1, `u_scaleZ_${suffix}`);
            transformCode.push(`
          pos *= vec3(${sx}, ${sy}, ${sz});`);
          } else {
            transformCode.push(`
          pos *= vec2(${sx}, ${sy});`);
          }
          break;
        }
        case "offset": {
          const getOffsetGlsl = (val, name) => {
            if (typeof val === "string") {
              const expr = parseShaderExpr(val);
              if (expr) return expr.toGLSL();
            }
            uniformDecls.push(`uniform float ${name};`);
            uniforms[name] = makeUniformAccessor(val);
            return name;
          };
          const ox = getOffsetGlsl(transform.args.x, `u_offsetX_${suffix}`);
          const oy = getOffsetGlsl(transform.args.y, `u_offsetY_${suffix}`);
          if (has3D) {
            const oz = getOffsetGlsl(transform.args.z || 0, `u_offsetZ_${suffix}`);
            transformCode.push(`
          pos += vec3(${ox}, ${oy}, ${oz});`);
          } else {
            transformCode.push(`
          pos += vec2(${ox}, ${oy});`);
          }
          break;
        }
        case "perspective": {
          hasPerspective = true;
          perspectiveUniform = `u_perspective_${suffix}`;
          uniformDecls.push(`uniform vec3 ${perspectiveUniform};`);
          uniforms[perspectiveUniform] = makeUniformAccessor([
            transform.args.fov,
            transform.args.near,
            transform.args.far
          ]);
          break;
        }
      }
    });
    let glsl;
    if (has3D) {
      const projectionCode = hasPerspective ? `
      // Perspective projection with aspect ratio correction
      float fov = ${perspectiveUniform}.x;
      float near = ${perspectiveUniform}.y;
      float far = ${perspectiveUniform}.z;
      float f = 1.0 / tan(radians(fov) / 2.0);
      float aspect = resolution.x / resolution.y;
      float rangeInv = 1.0 / (near - far);

      // Move camera back
      pos.z -= 2.0;

      // Apply perspective
      float w = -pos.z;
      gl_Position = vec4(
        pos.x * f / aspect,
        pos.y * f,
        (pos.z * (near + far) + 2.0 * near * far) * rangeInv,
        w
      );
      gl_PointSize = 2.0;` : `
      // Simple projection - just use z for depth, no perspective divide
      float aspect = resolution.x / resolution.y;
      gl_Position = vec4(pos.x / aspect, pos.y, pos.z * 0.1, 1.0);
      gl_PointSize = 2.0;`;
      const normalInit = useNormals ? `vec3 nrm = normalize(normal);` : `vec3 nrm = vec3(0.0, 0.0, 1.0);`;
      const tangentInit = useTangents ? `vec3 tang = normalize(tangent.xyz);
      float tanW = tangent.w;` : `vec3 tang = vec3(1.0, 0.0, 0.0);
      float tanW = 1.0;`;
      const worldNormalCode = normalTransformCode.length > 0 ? `// Apply rotation transforms to normal for world space
      ${normalTransformCode.join("\n      ")}
      v_worldNormal = normalize(nrm);` : `v_worldNormal = nrm;`;
      const worldTangentCode = tangentTransformCode.length > 0 ? `// Apply rotation transforms to tangent for world space
      ${tangentTransformCode.join("\n      ")}
      v_tangent = normalize(tang);` : `v_tangent = tang;`;
      glsl = `
    precision ${precision} float;
    attribute vec3 position;
    ${instanceAttributeDecl}
    ${uvAttributeDecl}
    ${faceIdAttributeDecl}
    ${normalAttributeDecl}
    ${tangentAttributeDecl}
    ${colorAttributeDecl}
    varying vec2 uv;
    ${faceIdVaryingDecl}
    ${instanceIdVaryingDecl}

    // Vertex data for fragment shader
    varying vec3 v_position;
    varying vec3 v_normal;
    varying vec3 v_worldNormal;
    varying vec3 v_tangent;
    varying vec3 v_bitangent;
    varying vec3 v_viewDir;
    varying float v_depth;
    varying vec4 v_color;

    uniform float time;
    uniform vec2 resolution;
    uniform vec2 u_boundsMin;
    uniform vec2 u_boundsMax;
    ${uniformDecls.join("\n    ")}

    void main () {
      // UV ${useExplicitUVs ? "from explicit attribute" : "normalized to shape bounds"}
      ${uvComputation}
      ${faceIdPassthrough}
      ${colorPassthrough}
      ${instanceIdPassthrough}

      // Apply transforms (3D)
      vec3 pos = position;
      ${instanceScaleCode}
      ${instanceRotationCode}
      ${transformCode.join("\n      ")}
      ${instanceOffsetCode}

      // Compute vertex data for fragment shader
      v_position = pos;

      // Model space normal (raw from vertex buffer)
      ${normalInit}
      v_normal = nrm;

      // World space normal (after rotation transforms)
      ${worldNormalCode}

      // Tangent and bitangent for normal mapping
      ${tangentInit}
      ${worldTangentCode}
      // Bitangent = cross(normal, tangent) * handedness
      v_bitangent = cross(v_worldNormal, v_tangent) * tanW;

      // Camera is at z = 2.0 (matching perspective projection)
      vec3 cameraPos = vec3(0.0, 0.0, 2.0);
      v_viewDir = normalize(cameraPos - pos);

      // Normalized depth: 0 = at camera, 1 = at far plane (approx 4 units away)
      float dist = length(cameraPos - pos);
      v_depth = clamp(dist / 4.0, 0.0, 1.0);

      ${projectionCode}
    }
  `;
    } else {
      glsl = `
    precision ${precision} float;
    attribute vec3 position;
    ${instanceAttributeDecl}
    ${uvAttributeDecl}
    ${faceIdAttributeDecl}
    ${colorAttributeDecl}
    varying vec2 uv;
    ${faceIdVaryingDecl}
    ${instanceIdVaryingDecl}

    // Vertex data for fragment shader (default values for 2D)
    varying vec3 v_position;
    varying vec3 v_normal;
    varying vec3 v_worldNormal;
    varying vec3 v_tangent;
    varying vec3 v_bitangent;
    varying vec3 v_viewDir;
    varying float v_depth;
    varying vec4 v_color;

    uniform float time;
    uniform vec2 u_boundsMin;
    uniform vec2 u_boundsMax;
    ${uniformDecls.join("\n    ")}

    void main () {
      // UV ${useExplicitUVs ? "from explicit attribute" : "normalized to shape bounds"}
      ${uvComputation}
      ${faceIdPassthrough}
      ${colorPassthrough}
      ${instanceIdPassthrough}

      // Apply transforms (2D)
      vec2 pos = position.xy;
      ${useInstanceScale ? "pos *= instanceScale.xy;" : ""}
      ${useInstanceRotation ? `{
        float c = cos(instanceRotation.z), s = sin(instanceRotation.z);
        pos = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c);
      }` : ""}
      ${transformCode.join("\n      ")}
      ${useInstancing ? "pos += instanceOffset.xy;" : ""}

      // Set default vertex data for 2D geometry
      v_position = vec3(pos, 0.0);
      v_normal = vec3(0.0, 0.0, 1.0);  // Facing camera
      v_worldNormal = vec3(0.0, 0.0, 1.0);  // Same as normal for 2D
      v_tangent = vec3(1.0, 0.0, 0.0);
      v_bitangent = vec3(0.0, 1.0, 0.0);
      v_viewDir = vec3(0.0, 0.0, 1.0);  // Looking at camera
      v_depth = 1.0;

      gl_Position = vec4(pos, 0.0, 1.0);
      gl_PointSize = 2.0;
    }
  `;
    }
    return { glsl, uniforms };
  }
  function parseObj(objText, options = {}) {
    const { swapYZ = false } = options;
    const vertices = [];
    const colors = [];
    const normals = [];
    const uvs = [];
    const faces = [];
    const materialNames = [];
    const materialToId = /* @__PURE__ */ new Map();
    let currentMaterial = null;
    const lines = objText.split("\n");
    for (const line2 of lines) {
      const parts = line2.trim().split(/\s+/);
      if (parts[0] === "v") {
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
        vertices.push(swapYZ ? [x, z, y] : [x, y, z]);
        if (parts.length >= 7) {
          colors.push([parseFloat(parts[4]), parseFloat(parts[5]), parseFloat(parts[6])]);
        }
      } else if (parts[0] === "vn") {
        const x = parseFloat(parts[1]);
        const y = parseFloat(parts[2]);
        const z = parseFloat(parts[3]);
        normals.push(swapYZ ? [x, z, y] : [x, y, z]);
      } else if (parts[0] === "vt") {
        uvs.push([parseFloat(parts[1]), parseFloat(parts[2])]);
      } else if (parts[0] === "usemtl") {
        const matName = parts.slice(1).join(" ");
        if (!materialToId.has(matName)) {
          materialToId.set(matName, materialNames.length);
          materialNames.push(matName);
        }
        currentMaterial = materialToId.get(matName);
      } else if (parts[0] === "f") {
        const faceVerts = [];
        const faceUVs = [];
        const faceNormals = [];
        for (let i2 = 1; i2 < parts.length; i2++) {
          const indices = parts[i2].split("/");
          faceVerts.push(parseInt(indices[0]) - 1);
          if (indices[1]) faceUVs.push(parseInt(indices[1]) - 1);
          if (indices[2]) faceNormals.push(parseInt(indices[2]) - 1);
        }
        faces.push({ verts: faceVerts, uvs: faceUVs, normals: faceNormals, material: currentMaterial });
      }
    }
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (const v2 of vertices) {
      minX = Math.min(minX, v2[0]);
      maxX = Math.max(maxX, v2[0]);
      minY = Math.min(minY, v2[1]);
      maxY = Math.max(maxY, v2[1]);
      minZ = Math.min(minZ, v2[2]);
      maxZ = Math.max(maxZ, v2[2]);
    }
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const rangeZ = maxZ - minZ;
    const maxRange = Math.max(rangeX, rangeY, rangeZ);
    const scale = 1 / maxRange;
    const verts = [];
    const outNormals = [];
    const outUVs = [];
    const outFaceIds = [];
    const outColors = [];
    const hasNormals = normals.length > 0;
    const hasExplicitUVs = uvs.length > 0;
    const hasMaterials = materialNames.length > 0;
    const hasColors = colors.length === vertices.length;
    const defaultQuadUVs = [[0, 0], [1, 0], [1, 1], [0, 1]];
    const defaultTriUVs = [[0, 0], [1, 0], [0.5, 1]];
    const addVertex = (vertIdx, uv, normalIdx, materialId) => {
      const v2 = vertices[vertIdx];
      verts.push((v2[0] - centerX) * scale);
      verts.push((v2[1] - centerY) * scale);
      verts.push((v2[2] - centerZ) * scale);
      if (hasNormals && normalIdx !== void 0) {
        const n = normals[normalIdx];
        outNormals.push(n[0], n[1], n[2]);
      }
      outUVs.push(uv[0], uv[1]);
      if (hasMaterials) {
        outFaceIds.push(materialId !== null ? materialId : 0);
      }
      if (hasColors) {
        const c = colors[vertIdx];
        outColors.push(c[0], c[1], c[2], 1);
      }
    };
    for (const face of faces) {
      const fv = face.verts;
      const fu = face.uvs;
      const fn = face.normals;
      const fm = face.material;
      if (fv.length === 3) {
        for (let i2 = 0; i2 < 3; i2++) {
          const uv = hasExplicitUVs && fu[i2] !== void 0 ? uvs[fu[i2]] : defaultTriUVs[i2];
          addVertex(fv[i2], uv, fn[i2], fm);
        }
      } else if (fv.length >= 4) {
        for (let i2 = 1; i2 < fv.length - 1; i2++) {
          const uv0 = hasExplicitUVs && fu[0] !== void 0 ? uvs[fu[0]] : defaultQuadUVs[0];
          const uv1 = hasExplicitUVs && fu[i2] !== void 0 ? uvs[fu[i2]] : defaultQuadUVs[i2];
          const uv2 = hasExplicitUVs && fu[i2 + 1] !== void 0 ? uvs[fu[i2 + 1]] : defaultQuadUVs[i2 + 1];
          addVertex(fv[0], uv0, fn[0], fm);
          addVertex(fv[i2], uv1, fn[i2], fm);
          addVertex(fv[i2 + 1], uv2, fn[i2 + 1], fm);
        }
      }
    }
    const vs = new VertexSource(verts);
    vs.is3D = true;
    if (outNormals.length > 0) vs.normals = outNormals;
    if (outUVs.length > 0) vs.uvs = outUVs;
    if (outFaceIds.length > 0) {
      vs.faceIds = outFaceIds;
      vs.materialNames = materialNames;
    }
    if (outColors.length > 0) vs.colors = outColors;
    return vs;
  }
  function applyUpCorrection(vs, up) {
    const PI = Math.PI;
    switch (up.toLowerCase()) {
      case "y":
      case "+y":
        return vs;
      case "-y":
        return vs.rotateX(PI);
      case "z":
      case "+z":
        return vs.rotateX(-PI / 2);
      case "-z":
        return vs.rotateX(PI / 2);
      case "x":
      case "+x":
        return vs.rotateZ(PI / 2);
      case "-x":
        return vs.rotateZ(-PI / 2);
      default:
        console.warn(`Unknown 'up' value: ${up}, using default Y-up`);
        return vs;
    }
  }
  async function loadObj(url, options = {}) {
    const { up = "y", ...parseOptions } = options;
    const startTime = performance.now();
    console.log(`[hydra-vertex] Loading OBJ: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load OBJ from ${url}: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    let model = parseObj(text, parseOptions);
    model = applyUpCorrection(model, up);
    const elapsed = (performance.now() - startTime).toFixed(0);
    const vertCount = model.vertices ? model.vertices.length / 3 : 0;
    console.log(`[hydra-vertex] ✓ OBJ loaded: ${vertCount} vertices in ${elapsed}ms`);
    return model;
  }
  function parseGlb(arrayBuffer, options = {}) {
    const { meshIndex = 0, primitiveIndex } = options;
    const view = new DataView(arrayBuffer);
    const magic = view.getUint32(0, true);
    if (magic !== 1179937895) {
      throw new Error("Invalid GLB file: bad magic number");
    }
    const version2 = view.getUint32(4, true);
    if (version2 !== 2) {
      throw new Error(`Unsupported glTF version: ${version2}`);
    }
    let jsonChunk = null;
    let binChunk = null;
    let offset = 12;
    while (offset < arrayBuffer.byteLength) {
      const chunkLength = view.getUint32(offset, true);
      const chunkType = view.getUint32(offset + 4, true);
      const chunkData = new Uint8Array(arrayBuffer, offset + 8, chunkLength);
      if (chunkType === 1313821514) {
        const decoder = new TextDecoder("utf-8");
        jsonChunk = JSON.parse(decoder.decode(chunkData));
      } else if (chunkType === 5130562) {
        binChunk = chunkData.buffer.slice(chunkData.byteOffset, chunkData.byteOffset + chunkData.byteLength);
      }
      offset += 8 + chunkLength;
      if (offset % 4 !== 0) offset += 4 - offset % 4;
    }
    if (!jsonChunk) throw new Error("GLB missing JSON chunk");
    return extractMeshFromGltf(jsonChunk, binChunk, meshIndex, primitiveIndex);
  }
  function extractMeshFromGltf(gltf, binBuffer, meshIndex, primitiveIndex) {
    const mesh = gltf.meshes?.[meshIndex];
    if (!mesh) throw new Error(`Mesh ${meshIndex} not found`);
    const readAccessor = (accessorIndex) => {
      const accessor = gltf.accessors[accessorIndex];
      const bufferView = gltf.bufferViews[accessor.bufferView];
      const componentType = accessor.componentType;
      const count = accessor.count;
      const type = accessor.type;
      const typeComponents = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
      const components = typeComponents[type] || 1;
      const TypedArray = {
        5120: Int8Array,
        // BYTE
        5121: Uint8Array,
        // UNSIGNED_BYTE
        5122: Int16Array,
        // SHORT
        5123: Uint16Array,
        // UNSIGNED_SHORT
        5125: Uint32Array,
        // UNSIGNED_INT
        5126: Float32Array
        // FLOAT
      }[componentType];
      if (!TypedArray) throw new Error(`Unsupported component type: ${componentType}`);
      const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
      const byteStride = bufferView.byteStride || 0;
      if (byteStride === 0 || byteStride === components * TypedArray.BYTES_PER_ELEMENT) {
        return new TypedArray(binBuffer, byteOffset, count * components);
      }
      const result = new TypedArray(count * components);
      const srcView = new DataView(binBuffer);
      for (let i2 = 0; i2 < count; i2++) {
        const srcOffset = byteOffset + i2 * byteStride;
        for (let j = 0; j < components; j++) {
          if (TypedArray === Float32Array) {
            result[i2 * components + j] = srcView.getFloat32(srcOffset + j * 4, true);
          } else if (TypedArray === Uint16Array) {
            result[i2 * components + j] = srcView.getUint16(srcOffset + j * 2, true);
          } else if (TypedArray === Uint32Array) {
            result[i2 * components + j] = srcView.getUint32(srcOffset + j * 4, true);
          }
        }
      }
      return result;
    };
    const primitives = primitiveIndex !== void 0 ? [mesh.primitives[primitiveIndex]] : mesh.primitives;
    if (!primitives || primitives.length === 0) {
      throw new Error(`No primitives found in mesh ${meshIndex}`);
    }
    const verts = [];
    const outNormals = [];
    const outUVs = [];
    const outTangents = [];
    const outColors = [];
    const outJoints = [];
    const outWeights = [];
    let hasAnyUVs = false;
    let hasAnySkinning = false;
    for (const primitive of primitives) {
      const positionAccessor = primitive.attributes.POSITION;
      if (positionAccessor === void 0) continue;
      const positions = readAccessor(positionAccessor);
      const normals = primitive.attributes.NORMAL !== void 0 ? readAccessor(primitive.attributes.NORMAL) : null;
      const uvs = primitive.attributes.TEXCOORD_0 !== void 0 ? readAccessor(primitive.attributes.TEXCOORD_0) : null;
      const tangents = primitive.attributes.TANGENT !== void 0 ? readAccessor(primitive.attributes.TANGENT) : null;
      const colors = primitive.attributes.COLOR_0 !== void 0 ? readAccessor(primitive.attributes.COLOR_0) : null;
      let colorStride = 0;
      if (colors && primitive.attributes.COLOR_0 !== void 0) {
        const colorAccessor = gltf.accessors[primitive.attributes.COLOR_0];
        colorStride = colorAccessor.type === "VEC4" ? 4 : 3;
      }
      const joints = primitive.attributes.JOINTS_0 !== void 0 ? readAccessor(primitive.attributes.JOINTS_0) : null;
      const weights = primitive.attributes.WEIGHTS_0 !== void 0 ? readAccessor(primitive.attributes.WEIGHTS_0) : null;
      if (uvs) hasAnyUVs = true;
      if (joints && weights) hasAnySkinning = true;
      const indices = primitive.indices !== void 0 ? readAccessor(primitive.indices) : null;
      const addVertex = (idx) => {
        verts.push(positions[idx * 3], positions[idx * 3 + 1], positions[idx * 3 + 2]);
        if (normals) {
          outNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2]);
        }
        if (uvs) {
          outUVs.push(uvs[idx * 2], uvs[idx * 2 + 1]);
        }
        if (tangents) {
          outTangents.push(tangents[idx * 4], tangents[idx * 4 + 1], tangents[idx * 4 + 2], tangents[idx * 4 + 3]);
        }
        if (colors) {
          if (colorStride === 4) {
            outColors.push(colors[idx * 4], colors[idx * 4 + 1], colors[idx * 4 + 2], colors[idx * 4 + 3]);
          } else {
            outColors.push(colors[idx * 3], colors[idx * 3 + 1], colors[idx * 3 + 2], 1);
          }
        }
        if (joints && weights) {
          outJoints.push(joints[idx * 4], joints[idx * 4 + 1], joints[idx * 4 + 2], joints[idx * 4 + 3]);
          outWeights.push(weights[idx * 4], weights[idx * 4 + 1], weights[idx * 4 + 2], weights[idx * 4 + 3]);
        }
      };
      if (indices) {
        for (let i2 = 0; i2 < indices.length; i2++) {
          addVertex(indices[i2]);
        }
      } else {
        const vertexCount = positions.length / 3;
        for (let i2 = 0; i2 < vertexCount; i2++) {
          addVertex(i2);
        }
      }
    }
    if (verts.length === 0) {
      throw new Error("No vertex data found in mesh");
    }
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i2 = 0; i2 < verts.length; i2 += 3) {
      minX = Math.min(minX, verts[i2]);
      maxX = Math.max(maxX, verts[i2]);
      minY = Math.min(minY, verts[i2 + 1]);
      maxY = Math.max(maxY, verts[i2 + 1]);
      minZ = Math.min(minZ, verts[i2 + 2]);
      maxZ = Math.max(maxZ, verts[i2 + 2]);
    }
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const rangeZ = maxZ - minZ;
    const maxRange = Math.max(rangeX, rangeY, rangeZ);
    const scale = maxRange > 0 ? 1 / maxRange : 1;
    for (let i2 = 0; i2 < verts.length; i2 += 3) {
      verts[i2] = (verts[i2] - centerX) * scale;
      verts[i2 + 1] = (verts[i2 + 1] - centerY) * scale;
      verts[i2 + 2] = (verts[i2 + 2] - centerZ) * scale;
    }
    if (!hasAnyUVs) {
      for (let i2 = 0; i2 < verts.length; i2 += 3) {
        const x = verts[i2], y = verts[i2 + 1], z = verts[i2 + 2];
        const u = 0.5 + Math.atan2(z, x) / (2 * Math.PI);
        const v2 = 0.5 + Math.asin(Math.max(-1, Math.min(1, y))) / Math.PI;
        outUVs.push(u, v2);
      }
    }
    const vs = new VertexSource(verts);
    vs.is3D = true;
    if (outNormals.length > 0) vs.normals = outNormals;
    if (outUVs.length > 0) vs.uvs = outUVs;
    if (outTangents.length > 0) vs.tangents = outTangents;
    if (outColors.length > 0) vs.colors = outColors;
    if (hasAnySkinning) {
      vs.joints = outJoints;
      vs.weights = outWeights;
    }
    vs._gltf = gltf;
    vs._binBuffer = binBuffer;
    if (hasAnySkinning) {
      vs._normCenter = [centerX, centerY, centerZ];
      vs._normScale = scale;
    }
    return vs;
  }
  async function loadGlb(url, options = {}) {
    const { extractTextures = true, up = "y", ...parseOptions } = options;
    const startTime = performance.now();
    console.log(`[hydra-vertex] Loading GLB: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load GLB from ${url}: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 12) {
      throw new Error(`Invalid GLB file from ${url}: file too small (${arrayBuffer.byteLength} bytes)`);
    }
    let model = parseGlb(arrayBuffer, parseOptions);
    if (extractTextures) {
      const textures = await extractGlbTextures(arrayBuffer);
      model.texture = textures[0]?.image || null;
      model.textures = textures.map((t) => t.image);
    }
    model = applyUpCorrection(model, up);
    const elapsed = (performance.now() - startTime).toFixed(0);
    const vertCount = model.vertices ? model.vertices.length / 3 : 0;
    console.log(`[hydra-vertex] ✓ GLB loaded: ${vertCount} vertices in ${elapsed}ms`);
    return model;
  }
  async function extractGlbTextures(arrayBuffer) {
    const view = new DataView(arrayBuffer);
    const magic = view.getUint32(0, true);
    if (magic !== 1179937895) throw new Error("Invalid GLB");
    let jsonChunk = null;
    let binStart = 0;
    let offset = 12;
    while (offset < arrayBuffer.byteLength) {
      const chunkLength = view.getUint32(offset, true);
      const chunkType = view.getUint32(offset + 4, true);
      if (chunkType === 1313821514) {
        const chunkData = new Uint8Array(arrayBuffer, offset + 8, chunkLength);
        jsonChunk = JSON.parse(new TextDecoder().decode(chunkData));
      } else if (chunkType === 5130562) {
        binStart = offset + 8;
      }
      offset += 8 + chunkLength;
      if (offset % 4 !== 0) offset += 4 - offset % 4;
    }
    if (!jsonChunk || !jsonChunk.images) return [];
    const textures = [];
    for (let i2 = 0; i2 < jsonChunk.images.length; i2++) {
      const imgDef = jsonChunk.images[i2];
      if (imgDef.bufferView === void 0) continue;
      const bv = jsonChunk.bufferViews[imgDef.bufferView];
      const imgBytes = new Uint8Array(arrayBuffer, binStart + (bv.byteOffset || 0), bv.byteLength);
      let mimeType = imgDef.mimeType;
      if (!mimeType) {
        if (imgBytes[0] === 137 && imgBytes[1] === 80) mimeType = "image/png";
        else if (imgBytes[0] === 255 && imgBytes[1] === 216) mimeType = "image/jpeg";
        else mimeType = "image/png";
      }
      const blob = new Blob([imgBytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
      });
      textures.push({ image: img, index: i2, blobUrl: url });
    }
    return textures;
  }
  function extractSkeleton(gltf, binBuffer, skinIndex = 0) {
    if (!gltf.skins || !gltf.skins[skinIndex]) return null;
    const skin = gltf.skins[skinIndex];
    const joints = skin.joints;
    let inverseBindMatrices = null;
    if (skin.inverseBindMatrices !== void 0) {
      const accessor = gltf.accessors[skin.inverseBindMatrices];
      const bufferView = gltf.bufferViews[accessor.bufferView];
      const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
      const byteLength = accessor.count * 16 * 4;
      const slice = binBuffer.slice(byteOffset, byteOffset + byteLength);
      inverseBindMatrices = new Float32Array(slice);
    }
    const jointData = joints.map((nodeIndex, i2) => {
      const node = gltf.nodes[nodeIndex];
      return {
        index: i2,
        nodeIndex,
        name: node.name || `joint_${i2}`,
        children: node.children || [],
        // Local transform (TRS)
        translation: node.translation || [0, 0, 0],
        rotation: node.rotation || [0, 0, 0, 1],
        // quaternion
        scale: node.scale || [1, 1, 1],
        // Inverse bind matrix (16 floats)
        inverseBindMatrix: inverseBindMatrices ? Array.from(inverseBindMatrices.slice(i2 * 16, i2 * 16 + 16)) : identityMatrix()
      };
    });
    return {
      joints: jointData,
      jointCount: joints.length,
      jointNodeIndices: joints
    };
  }
  function extractAnimations(gltf, binBuffer) {
    if (!gltf.animations) return [];
    const readAccessor = (accessorIndex) => {
      const accessor = gltf.accessors[accessorIndex];
      const bufferView = gltf.bufferViews[accessor.bufferView];
      const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
      return new Float32Array(binBuffer, byteOffset, accessor.count * (accessor.type === "SCALAR" ? 1 : accessor.type === "VEC3" ? 3 : accessor.type === "VEC4" ? 4 : 1));
    };
    return gltf.animations.map((anim, animIndex) => {
      const channels = anim.channels.map((channel) => {
        const sampler = anim.samplers[channel.sampler];
        const times = readAccessor(sampler.input);
        const values = readAccessor(sampler.output);
        return {
          targetNode: channel.target.node,
          targetPath: channel.target.path,
          // 'translation', 'rotation', 'scale'
          interpolation: sampler.interpolation || "LINEAR",
          times: Array.from(times),
          values: Array.from(values)
        };
      });
      const duration = channels.reduce((max, ch) => Math.max(max, ch.times[ch.times.length - 1] || 0), 0);
      return {
        name: anim.name || `animation_${animIndex}`,
        duration,
        channels
      };
    });
  }
  function identityMatrix() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }
  function multiplyMatrices(a, b) {
    const result = new Array(16);
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        result[col * 4 + row] = a[0 * 4 + row] * b[col * 4 + 0] + a[1 * 4 + row] * b[col * 4 + 1] + a[2 * 4 + row] * b[col * 4 + 2] + a[3 * 4 + row] * b[col * 4 + 3];
      }
    }
    return result;
  }
  function trsToMatrix(t, r, s) {
    const [tx, ty, tz] = t;
    const [qx, qy, qz, qw] = r;
    const [sx, sy, sz] = s;
    const xx = qx * qx, yy = qy * qy, zz = qz * qz;
    const xy = qx * qy, xz = qx * qz, yz = qy * qz;
    const wx = qw * qx, wy = qw * qy, wz = qw * qz;
    const m0 = (1 - 2 * (yy + zz)) * sx;
    const m1 = 2 * (xy + wz) * sx;
    const m2 = 2 * (xz - wy) * sx;
    const m4 = 2 * (xy - wz) * sy;
    const m5 = (1 - 2 * (xx + zz)) * sy;
    const m6 = 2 * (yz + wx) * sy;
    const m8 = 2 * (xz + wy) * sz;
    const m9 = 2 * (yz - wx) * sz;
    const m10 = (1 - 2 * (xx + yy)) * sz;
    return [
      m0,
      m1,
      m2,
      0,
      // column 0
      m4,
      m5,
      m6,
      0,
      // column 1
      m8,
      m9,
      m10,
      0,
      // column 2
      tx,
      ty,
      tz,
      1
      // column 3 (translation)
    ];
  }
  function transformPoint(m, p) {
    const x = p[0], y = p[1], z = p[2];
    return [
      m[0] * x + m[4] * y + m[8] * z + m[12],
      m[1] * x + m[5] * y + m[9] * z + m[13],
      m[2] * x + m[6] * y + m[10] * z + m[14]
    ];
  }
  function transformNormal(m, n) {
    const x = n[0], y = n[1], z = n[2];
    const nx = m[0] * x + m[4] * y + m[8] * z;
    const ny = m[1] * x + m[5] * y + m[9] * z;
    const nz = m[2] * x + m[6] * y + m[10] * z;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    return len > 0 ? [nx / len, ny / len, nz / len] : [0, 1, 0];
  }
  function sampleAnimation(channel, time) {
    const { times, values, targetPath, interpolation } = channel;
    const componentCount = targetPath === "rotation" ? 4 : 3;
    if (time <= times[0]) {
      return values.slice(0, componentCount);
    }
    if (time >= times[times.length - 1]) {
      const start = (times.length - 1) * componentCount;
      return values.slice(start, start + componentCount);
    }
    let i2 = 0;
    while (i2 < times.length - 1 && times[i2 + 1] < time) i2++;
    const t0 = times[i2], t1 = times[i2 + 1];
    const alpha = (time - t0) / (t1 - t0);
    const v0Start = i2 * componentCount;
    const v1Start = (i2 + 1) * componentCount;
    if (interpolation === "STEP") {
      return values.slice(v0Start, v0Start + componentCount);
    }
    if (targetPath === "rotation") {
      return slerpQuat(
        values.slice(v0Start, v0Start + 4),
        values.slice(v1Start, v1Start + 4),
        alpha
      );
    } else {
      const result = [];
      for (let j = 0; j < componentCount; j++) {
        result.push(values[v0Start + j] * (1 - alpha) + values[v1Start + j] * alpha);
      }
      return result;
    }
  }
  function slerpQuat(q1, q2, t) {
    let dot = q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3];
    if (dot < 0) {
      q2 = [-q2[0], -q2[1], -q2[2], -q2[3]];
      dot = -dot;
    }
    if (dot > 0.9995) {
      const result = [
        q1[0] + t * (q2[0] - q1[0]),
        q1[1] + t * (q2[1] - q1[1]),
        q1[2] + t * (q2[2] - q1[2]),
        q1[3] + t * (q2[3] - q1[3])
      ];
      const len = Math.sqrt(result[0] ** 2 + result[1] ** 2 + result[2] ** 2 + result[3] ** 2);
      return result.map((v2) => v2 / len);
    }
    const theta0 = Math.acos(dot);
    const theta = theta0 * t;
    const sinTheta = Math.sin(theta);
    const sinTheta0 = Math.sin(theta0);
    const s0 = Math.cos(theta) - dot * sinTheta / sinTheta0;
    const s1 = sinTheta / sinTheta0;
    return [
      s0 * q1[0] + s1 * q2[0],
      s0 * q1[1] + s1 * q2[1],
      s0 * q1[2] + s1 * q2[2],
      s0 * q1[3] + s1 * q2[3]
    ];
  }
  function computeSkinningMatrices(skeleton, animations, clipName, time, gltf, normCenter = null, normScale = 1) {
    if (!skeleton) return null;
    const clip = animations.find((a) => a.name === clipName) || animations[0];
    if (!clip) return null;
    const nodeToJoint = /* @__PURE__ */ new Map();
    skeleton.joints.forEach((joint, i2) => {
      nodeToJoint.set(joint.nodeIndex, i2);
    });
    const localTransforms = skeleton.joints.map((joint, jointIdx) => {
      let t = [...joint.translation];
      let r = [...joint.rotation];
      let s = [...joint.scale];
      for (const channel of clip.channels) {
        if (channel.targetNode === joint.nodeIndex) {
          const sampled = sampleAnimation(channel, time);
          if (channel.targetPath === "translation") t = sampled;
          else if (channel.targetPath === "rotation") r = sampled;
          else if (channel.targetPath === "scale") s = sampled;
        }
      }
      return trsToMatrix(t, r, s);
    });
    const worldTransforms = new Array(skeleton.joints.length);
    const parentMap = /* @__PURE__ */ new Map();
    gltf.nodes.forEach((node, nodeIdx) => {
      if (node.children) {
        node.children.forEach((childIdx) => parentMap.set(childIdx, nodeIdx));
      }
    });
    const computeWorld = (jointIndex) => {
      if (worldTransforms[jointIndex]) return worldTransforms[jointIndex];
      const joint = skeleton.joints[jointIndex];
      const parentNodeIndex = parentMap.get(joint.nodeIndex);
      if (parentNodeIndex !== void 0 && nodeToJoint.has(parentNodeIndex)) {
        const parentJointIndex = nodeToJoint.get(parentNodeIndex);
        const parentWorld = computeWorld(parentJointIndex);
        worldTransforms[jointIndex] = multiplyMatrices(parentWorld, localTransforms[jointIndex]);
      } else {
        worldTransforms[jointIndex] = localTransforms[jointIndex];
      }
      return worldTransforms[jointIndex];
    };
    const rawMatrices = skeleton.joints.map((joint, i2) => {
      const globalTransform = computeWorld(i2);
      return multiplyMatrices(globalTransform, joint.inverseBindMatrix);
    });
    if (normCenter) {
      const [cx, cy, cz] = normCenter;
      const s = normScale;
      const invS = 1 / s;
      return rawMatrices.map((M) => {
        const MN = [
          M[0] * invS,
          M[1] * invS,
          M[2] * invS,
          M[3],
          M[4] * invS,
          M[5] * invS,
          M[6] * invS,
          M[7],
          M[8] * invS,
          M[9] * invS,
          M[10] * invS,
          M[11],
          M[0] * cx + M[4] * cy + M[8] * cz + M[12],
          M[1] * cx + M[5] * cy + M[9] * cz + M[13],
          M[2] * cx + M[6] * cy + M[10] * cz + M[14],
          M[3] * cx + M[7] * cy + M[11] * cz + M[15]
        ];
        return [
          s * MN[0],
          s * MN[1],
          s * MN[2],
          MN[3],
          s * MN[4],
          s * MN[5],
          s * MN[6],
          MN[7],
          s * MN[8],
          s * MN[9],
          s * MN[10],
          MN[11],
          s * MN[12] - cx * s,
          s * MN[13] - cy * s,
          s * MN[14] - cz * s,
          MN[15]
        ];
      });
    }
    return rawMatrices;
  }
  function applySkinning(vertices, normals, joints, weights, skinningMatrices) {
    const vertexCount = vertices.length / 3;
    const skinnedVerts = new Array(vertices.length);
    const skinnedNormals = normals ? new Array(normals.length) : null;
    for (let v2 = 0; v2 < vertexCount; v2++) {
      const vi = v2 * 3;
      const ji = v2 * 4;
      const pos = [vertices[vi], vertices[vi + 1], vertices[vi + 2]];
      const norm = normals ? [normals[vi], normals[vi + 1], normals[vi + 2]] : null;
      let skinnedPos = [0, 0, 0];
      let skinnedNorm = normals ? [0, 0, 0] : null;
      for (let i2 = 0; i2 < 4; i2++) {
        const jointIndex = joints[ji + i2];
        const weight = weights[ji + i2];
        if (weight > 0 && skinningMatrices[jointIndex]) {
          const mat = skinningMatrices[jointIndex];
          const transformedPos = transformPoint(mat, pos);
          skinnedPos[0] += transformedPos[0] * weight;
          skinnedPos[1] += transformedPos[1] * weight;
          skinnedPos[2] += transformedPos[2] * weight;
          if (normals) {
            const transformedNorm = transformNormal(mat, norm);
            skinnedNorm[0] += transformedNorm[0] * weight;
            skinnedNorm[1] += transformedNorm[1] * weight;
            skinnedNorm[2] += transformedNorm[2] * weight;
          }
        }
      }
      skinnedVerts[vi] = skinnedPos[0];
      skinnedVerts[vi + 1] = skinnedPos[1];
      skinnedVerts[vi + 2] = skinnedPos[2];
      if (normals) {
        const len = Math.sqrt(skinnedNorm[0] ** 2 + skinnedNorm[1] ** 2 + skinnedNorm[2] ** 2);
        skinnedNormals[vi] = len > 0 ? skinnedNorm[0] / len : 0;
        skinnedNormals[vi + 1] = len > 0 ? skinnedNorm[1] / len : 1;
        skinnedNormals[vi + 2] = len > 0 ? skinnedNorm[2] / len : 0;
      }
    }
    return { vertices: skinnedVerts, normals: skinnedNormals };
  }
  function tri(size = 1, centerX = 0, centerY = 0) {
    const h = size * Math.sqrt(3) / 2;
    const verts = [
      centerX,
      centerY + h * 2 / 3,
      centerX - size / 2,
      centerY - h / 3,
      centerX + size / 2,
      centerY - h / 3
    ];
    return new VertexSource(verts);
  }
  function quad(width = 1, height = 1, centerX = 0, centerY = 0) {
    const hw = width / 2, hh = height / 2;
    const verts = [
      // Triangle 1
      centerX - hw,
      centerY - hh,
      centerX + hw,
      centerY - hh,
      centerX + hw,
      centerY + hh,
      // Triangle 2
      centerX - hw,
      centerY - hh,
      centerX + hw,
      centerY + hh,
      centerX - hw,
      centerY + hh
    ];
    return new VertexSource(verts);
  }
  function poly(sides, radius = 1, centerX = 0, centerY = 0) {
    const verts = [];
    for (let i2 = 0; i2 < sides; i2++) {
      const a1 = i2 / sides * Math.PI * 2 - Math.PI / 2;
      const a2 = (i2 + 1) / sides * Math.PI * 2 - Math.PI / 2;
      verts.push(centerX, centerY);
      verts.push(centerX + Math.cos(a1) * radius, centerY + Math.sin(a1) * radius);
      verts.push(centerX + Math.cos(a2) * radius, centerY + Math.sin(a2) * radius);
    }
    return new VertexSource(verts);
  }
  function circle(radius = 1, centerX = 0, centerY = 0, segments = 32) {
    return poly(segments, radius, centerX, centerY);
  }
  function line(x1, y1, x2, y2, thickness = 0.02) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len * thickness / 2;
    const ny = dx / len * thickness / 2;
    const verts = [
      x1 + nx,
      y1 + ny,
      x1 - nx,
      y1 - ny,
      x2 - nx,
      y2 - ny,
      x1 + nx,
      y1 + ny,
      x2 - nx,
      y2 - ny,
      x2 + nx,
      y2 + ny
    ];
    return new VertexSource(verts);
  }
  function ring(outerRadius = 1, innerRadius = 0.5, centerX = 0, centerY = 0, segments = 32) {
    const verts = [];
    for (let i2 = 0; i2 < segments; i2++) {
      const a1 = i2 / segments * Math.PI * 2;
      const a2 = (i2 + 1) / segments * Math.PI * 2;
      const cos1 = Math.cos(a1), sin1 = Math.sin(a1);
      const cos2 = Math.cos(a2), sin2 = Math.sin(a2);
      verts.push(centerX + cos1 * innerRadius, centerY + sin1 * innerRadius);
      verts.push(centerX + cos1 * outerRadius, centerY + sin1 * outerRadius);
      verts.push(centerX + cos2 * outerRadius, centerY + sin2 * outerRadius);
      verts.push(centerX + cos1 * innerRadius, centerY + sin1 * innerRadius);
      verts.push(centerX + cos2 * outerRadius, centerY + sin2 * outerRadius);
      verts.push(centerX + cos2 * innerRadius, centerY + sin2 * innerRadius);
    }
    return new VertexSource(verts);
  }
  function cube(size = 0.5) {
    const s = size;
    const corners = [
      [-s, -s, s],
      // 0: front-bottom-left
      [s, -s, s],
      // 1: front-bottom-right
      [s, s, s],
      // 2: front-top-right
      [-s, s, s],
      // 3: front-top-left
      [-s, -s, -s],
      // 4: back-bottom-left
      [s, -s, -s],
      // 5: back-bottom-right
      [s, s, -s],
      // 6: back-top-right
      [-s, s, -s]
      // 7: back-top-left
    ];
    const faces = [
      { indices: [0, 1, 2, 0, 2, 3], uvs: [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]] },
      // front (0)
      { indices: [5, 4, 7, 5, 7, 6], uvs: [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]] },
      // back (1)
      { indices: [3, 2, 6, 3, 6, 7], uvs: [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]] },
      // top (2)
      { indices: [4, 5, 1, 4, 1, 0], uvs: [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]] },
      // bottom (3)
      { indices: [1, 5, 6, 1, 6, 2], uvs: [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]] },
      // right (4)
      { indices: [4, 0, 3, 4, 3, 7], uvs: [[0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]] }
      // left (5)
    ];
    const verts = [];
    const uvs = [];
    const faceIds = [];
    for (let faceIdx = 0; faceIdx < faces.length; faceIdx++) {
      const face = faces[faceIdx];
      for (let i2 = 0; i2 < face.indices.length; i2++) {
        verts.push(...corners[face.indices[i2]]);
        uvs.push(...face.uvs[i2]);
        faceIds.push(faceIdx);
      }
    }
    const vs = new VertexSource(verts);
    vs.uvs = uvs;
    vs.faceIds = faceIds;
    vs.is3D = true;
    return vs;
  }
  function sphere(radius = 0.5, segments = 32, rings = 16) {
    const verts = [];
    const normals = [];
    const uvs = [];
    for (let ring2 = 0; ring2 <= rings; ring2++) {
      const theta = ring2 / rings * Math.PI;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      for (let seg = 0; seg <= segments; seg++) {
        const phi = seg / segments * Math.PI * 2;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const nx = sinTheta * cosPhi;
        const ny = cosTheta;
        const nz = sinTheta * sinPhi;
        const x = nx * radius;
        const y = ny * radius;
        const z = nz * radius;
        const u = seg / segments;
        const v2 = ring2 / rings;
        verts.push(x, y, z);
        normals.push(nx, ny, nz);
        uvs.push(u, v2);
      }
    }
    const outVerts = [];
    const outNormals = [];
    const outUVs = [];
    const stride = segments + 1;
    for (let ring2 = 0; ring2 < rings; ring2++) {
      for (let seg = 0; seg < segments; seg++) {
        const i0 = ring2 * stride + seg;
        const i1 = i0 + 1;
        const i2 = i0 + stride;
        const i3 = i2 + 1;
        const indices = [i0, i2, i1, i1, i2, i3];
        for (const idx of indices) {
          outVerts.push(verts[idx * 3], verts[idx * 3 + 1], verts[idx * 3 + 2]);
          outNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2]);
          outUVs.push(uvs[idx * 2], uvs[idx * 2 + 1]);
        }
      }
    }
    const vs = new VertexSource(outVerts);
    vs.normals = outNormals;
    vs.uvs = outUVs;
    vs.is3D = true;
    return vs;
  }
  function plane(width = 1, height = 1, subdivisionsX = 1, subdivisionsY = 1) {
    const verts = [];
    const normals = [];
    const uvs = [];
    const halfW = width / 2;
    const halfH = height / 2;
    for (let y = 0; y <= subdivisionsY; y++) {
      for (let x = 0; x <= subdivisionsX; x++) {
        const u = x / subdivisionsX;
        const v2 = y / subdivisionsY;
        const px = -halfW + u * width;
        const pz = -halfH + v2 * height;
        verts.push(px, 0, pz);
        normals.push(0, 1, 0);
        uvs.push(u, v2);
      }
    }
    const outVerts = [];
    const outNormals = [];
    const outUVs = [];
    const stride = subdivisionsX + 1;
    for (let y = 0; y < subdivisionsY; y++) {
      for (let x = 0; x < subdivisionsX; x++) {
        const i0 = y * stride + x;
        const i1 = i0 + 1;
        const i2 = i0 + stride;
        const i3 = i2 + 1;
        const indices = [i0, i2, i1, i1, i2, i3];
        for (const idx of indices) {
          outVerts.push(verts[idx * 3], verts[idx * 3 + 1], verts[idx * 3 + 2]);
          outNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2]);
          outUVs.push(uvs[idx * 2], uvs[idx * 2 + 1]);
        }
      }
    }
    const vs = new VertexSource(outVerts);
    vs.normals = outNormals;
    vs.uvs = outUVs;
    vs.is3D = true;
    return vs;
  }
  function torus(radius = 0.4, tubeRadius = 0.15, radialSegments = 32, tubularSegments = 16) {
    const verts = [];
    const normals = [];
    const uvs = [];
    for (let i2 = 0; i2 <= radialSegments; i2++) {
      const u = i2 / radialSegments;
      const theta = u * Math.PI * 2;
      for (let j = 0; j <= tubularSegments; j++) {
        const v2 = j / tubularSegments;
        const phi = v2 * Math.PI * 2;
        const x = (radius + tubeRadius * Math.cos(phi)) * Math.cos(theta);
        const y = tubeRadius * Math.sin(phi);
        const z = (radius + tubeRadius * Math.cos(phi)) * Math.sin(theta);
        const cx = radius * Math.cos(theta);
        const cz = radius * Math.sin(theta);
        const nx = x - cx;
        const ny = y;
        const nz = z - cz;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        verts.push(x, y, z);
        normals.push(nx / len, ny / len, nz / len);
        uvs.push(u, v2);
      }
    }
    const outVerts = [];
    const outNormals = [];
    const outUVs = [];
    const stride = tubularSegments + 1;
    for (let i2 = 0; i2 < radialSegments; i2++) {
      for (let j = 0; j < tubularSegments; j++) {
        const i0 = i2 * stride + j;
        const i1 = i0 + 1;
        const i22 = i0 + stride;
        const i3 = i22 + 1;
        const indices = [i0, i1, i22, i1, i3, i22];
        for (const idx of indices) {
          outVerts.push(verts[idx * 3], verts[idx * 3 + 1], verts[idx * 3 + 2]);
          outNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2]);
          outUVs.push(uvs[idx * 2], uvs[idx * 2 + 1]);
        }
      }
    }
    const vs = new VertexSource(outVerts);
    vs.normals = outNormals;
    vs.uvs = outUVs;
    vs.is3D = true;
    return vs;
  }
  function cylinder(radius = 0.3, height = 1, radialSegments = 32, heightSegments = 1, caps = true) {
    const verts = [];
    const normals = [];
    const uvs = [];
    const halfHeight = height / 2;
    for (let y = 0; y <= heightSegments; y++) {
      const v2 = y / heightSegments;
      const py = -halfHeight + v2 * height;
      for (let i2 = 0; i2 <= radialSegments; i2++) {
        const u = i2 / radialSegments;
        const theta = u * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        verts.push(cosT * radius, py, sinT * radius);
        normals.push(cosT, 0, sinT);
        uvs.push(u, v2);
      }
    }
    const outVerts = [];
    const outNormals = [];
    const outUVs = [];
    const stride = radialSegments + 1;
    for (let y = 0; y < heightSegments; y++) {
      for (let i2 = 0; i2 < radialSegments; i2++) {
        const i0 = y * stride + i2;
        const i1 = i0 + 1;
        const i22 = i0 + stride;
        const i3 = i22 + 1;
        const indices = [i0, i22, i1, i1, i22, i3];
        for (const idx of indices) {
          outVerts.push(verts[idx * 3], verts[idx * 3 + 1], verts[idx * 3 + 2]);
          outNormals.push(normals[idx * 3], normals[idx * 3 + 1], normals[idx * 3 + 2]);
          outUVs.push(uvs[idx * 2], uvs[idx * 2 + 1]);
        }
      }
    }
    if (caps) {
      for (let i2 = 0; i2 < radialSegments; i2++) {
        const theta1 = i2 / radialSegments * Math.PI * 2;
        const theta2 = (i2 + 1) / radialSegments * Math.PI * 2;
        outVerts.push(0, halfHeight, 0);
        outNormals.push(0, 1, 0);
        outUVs.push(0.5, 0.5);
        outVerts.push(Math.cos(theta2) * radius, halfHeight, Math.sin(theta2) * radius);
        outNormals.push(0, 1, 0);
        outUVs.push(0.5 + Math.cos(theta2) * 0.5, 0.5 + Math.sin(theta2) * 0.5);
        outVerts.push(Math.cos(theta1) * radius, halfHeight, Math.sin(theta1) * radius);
        outNormals.push(0, 1, 0);
        outUVs.push(0.5 + Math.cos(theta1) * 0.5, 0.5 + Math.sin(theta1) * 0.5);
      }
      for (let i2 = 0; i2 < radialSegments; i2++) {
        const theta1 = i2 / radialSegments * Math.PI * 2;
        const theta2 = (i2 + 1) / radialSegments * Math.PI * 2;
        outVerts.push(0, -halfHeight, 0);
        outNormals.push(0, -1, 0);
        outUVs.push(0.5, 0.5);
        outVerts.push(Math.cos(theta1) * radius, -halfHeight, Math.sin(theta1) * radius);
        outNormals.push(0, -1, 0);
        outUVs.push(0.5 + Math.cos(theta1) * 0.5, 0.5 + Math.sin(theta1) * 0.5);
        outVerts.push(Math.cos(theta2) * radius, -halfHeight, Math.sin(theta2) * radius);
        outNormals.push(0, -1, 0);
        outUVs.push(0.5 + Math.cos(theta2) * 0.5, 0.5 + Math.sin(theta2) * 0.5);
      }
    }
    const vs = new VertexSource(outVerts);
    vs.normals = outNormals;
    vs.uvs = outUVs;
    vs.is3D = true;
    return vs;
  }
  function cone(radius = 0.3, height = 1, radialSegments = 32, caps = true) {
    const outVerts = [];
    const outNormals = [];
    const outUVs = [];
    const halfHeight = height / 2;
    const apex = halfHeight;
    const base = -halfHeight;
    const slopeAngle = Math.atan2(radius, height);
    const ny = Math.sin(slopeAngle);
    const nxz = Math.cos(slopeAngle);
    for (let i2 = 0; i2 < radialSegments; i2++) {
      const theta1 = i2 / radialSegments * Math.PI * 2;
      const theta2 = (i2 + 1) / radialSegments * Math.PI * 2;
      const cosT1 = Math.cos(theta1), sinT1 = Math.sin(theta1);
      const cosT2 = Math.cos(theta2), sinT2 = Math.sin(theta2);
      outVerts.push(0, apex, 0);
      const midTheta = (theta1 + theta2) / 2;
      outNormals.push(Math.cos(midTheta) * nxz, ny, Math.sin(midTheta) * nxz);
      outUVs.push(0.5, 0);
      outVerts.push(cosT1 * radius, base, sinT1 * radius);
      outNormals.push(cosT1 * nxz, ny, sinT1 * nxz);
      outUVs.push(i2 / radialSegments, 1);
      outVerts.push(cosT2 * radius, base, sinT2 * radius);
      outNormals.push(cosT2 * nxz, ny, sinT2 * nxz);
      outUVs.push((i2 + 1) / radialSegments, 1);
    }
    if (caps) {
      for (let i2 = 0; i2 < radialSegments; i2++) {
        const theta1 = i2 / radialSegments * Math.PI * 2;
        const theta2 = (i2 + 1) / radialSegments * Math.PI * 2;
        outVerts.push(0, base, 0);
        outNormals.push(0, -1, 0);
        outUVs.push(0.5, 0.5);
        outVerts.push(Math.cos(theta1) * radius, base, Math.sin(theta1) * radius);
        outNormals.push(0, -1, 0);
        outUVs.push(0.5 + Math.cos(theta1) * 0.5, 0.5 + Math.sin(theta1) * 0.5);
        outVerts.push(Math.cos(theta2) * radius, base, Math.sin(theta2) * radius);
        outNormals.push(0, -1, 0);
        outUVs.push(0.5 + Math.cos(theta2) * 0.5, 0.5 + Math.sin(theta2) * 0.5);
      }
    }
    const vs = new VertexSource(outVerts);
    vs.normals = outNormals;
    vs.uvs = outUVs;
    vs.is3D = true;
    return vs;
  }
  class VaryingRef {
    constructor(glslName, wgslName) {
      this.glslName = glslName;
      this.wgslName = wgslName;
      this._isVaryingRef = true;
    }
    // Default toString returns GLSL name
    toString() {
      return this.glslName;
    }
  }
  function createComponentProxy(baseName) {
    return new Proxy({}, {
      get(target, prop) {
        if (typeof prop === "string") {
          const glslPath = `${baseName}.${prop}`;
          const wgslPath = `${baseName}.${prop}`;
          return new VaryingRef(glslPath, wgslPath);
        }
        return void 0;
      }
    });
  }
  const v = new Proxy({}, {
    get(target, prop) {
      switch (prop) {
        case "position":
          return createComponentProxy("v_position");
        case "normal":
          return createComponentProxy("v_normal");
        case "worldNormal":
          return createComponentProxy("v_worldNormal");
        case "tangent":
          return createComponentProxy("v_tangent");
        case "bitangent":
          return createComponentProxy("v_bitangent");
        case "color":
          return createComponentProxy("v_color");
        case "viewDir":
          return createComponentProxy("v_viewDir");
        case "depth":
          return new VaryingRef("v_depth", "v_depth");
        case "uv":
          return createComponentProxy("uv");
        case "faceId":
          return new VaryingRef("v_faceId", "v_faceId");
        default:
          console.warn(`Unknown varying property: v.${prop}`);
          return void 0;
      }
    }
  });
  function isVaryingRef(value) {
    return value && value._isVaryingRef === true;
  }
  function getVaryingString(varyingRef, isWGSL) {
    if (!isVaryingRef(varyingRef)) return varyingRef;
    return isWGSL ? varyingRef.wgslName : varyingRef.glslName;
  }
  const easing = {
    // no easing, no acceleration
    linear: function(t) {
      return t;
    },
    // accelerating from zero velocity
    easeInQuad: function(t) {
      return t * t;
    },
    // decelerating to zero velocity
    easeOutQuad: function(t) {
      return t * (2 - t);
    },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    // accelerating from zero velocity
    easeInCubic: function(t) {
      return t * t * t;
    },
    // decelerating to zero velocity
    easeOutCubic: function(t) {
      return --t * t * t + 1;
    },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    // accelerating from zero velocity
    easeInQuart: function(t) {
      return t * t * t * t;
    },
    // decelerating to zero velocity
    easeOutQuart: function(t) {
      return 1 - --t * t * t * t;
    },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function(t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
    },
    // accelerating from zero velocity
    easeInQuint: function(t) {
      return t * t * t * t * t;
    },
    // decelerating to zero velocity
    easeOutQuint: function(t) {
      return 1 + --t * t * t * t * t;
    },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function(t) {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
    },
    // sin shape
    sin: function(t) {
      return (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2;
    }
  };
  var map = (num, in_min, in_max, out_min, out_max) => {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
  };
  var modulo = (n, d) => {
    return (n % d + d) % d;
  };
  const arrayUtils = {
    init: () => {
      Array.prototype.fast = function(speed = 1) {
        this._speed = speed;
        return this;
      };
      Array.prototype.smooth = function(smooth = 1) {
        this._smooth = smooth;
        return this;
      };
      Array.prototype.ease = function(ease = "linear") {
        if (typeof ease == "function") {
          this._smooth = 1;
          this._ease = ease;
        } else if (easing[ease]) {
          this._smooth = 1;
          this._ease = easing[ease];
        }
        return this;
      };
      Array.prototype.offset = function(offset = 0.5) {
        this._offset = offset % 1;
        return this;
      };
      Array.prototype.fit = function(low = 0, high = 1) {
        let lowest = Math.min(...this);
        let highest = Math.max(...this);
        var newArr = this.map((num) => map(num, lowest, highest, low, high));
        newArr._speed = this._speed;
        newArr._smooth = this._smooth;
        newArr._ease = this._ease;
        return newArr;
      };
    },
    getValue: (arr = []) => ({ time, bpm }) => {
      let speed = arr._speed ? arr._speed : 1;
      let smooth = arr._smooth ? arr._smooth : 0;
      let index = time * speed * (bpm / 60) + (arr._offset || 0);
      if (smooth !== 0) {
        let ease = arr._ease ? arr._ease : easing["linear"];
        let _index = index - smooth / 2;
        let currValue = arr[Math.floor(modulo(_index, arr.length))];
        let nextValue = arr[Math.floor(modulo(_index + 1, arr.length))];
        let t = Math.min(modulo(_index, 1) / smooth, 1);
        return ease(t) * (nextValue - currValue) + currValue;
      } else {
        arr[Math.floor(index % arr.length)];
        return arr[Math.floor(index % arr.length)];
      }
    }
  };
  const ensure_decimal_dot = (val) => {
    val = val.toString();
    if (val.indexOf(".") < 0) {
      val += ".";
    }
    return val;
  };
  function formatArguments(transform, startIndex, synthContext) {
    const defaultArgs = transform.transform.inputs;
    const userArgs = transform.userArgs;
    const { generators } = transform.synth;
    const { src } = generators;
    return defaultArgs.map((input, index) => {
      const typedArg = {
        value: input.default,
        type: input.type,
        //
        isUniform: false,
        name: input.name,
        vecLen: 0
        //  generateGlsl: null // function for creating glsl
      };
      if (typedArg.type === "float") typedArg.value = ensure_decimal_dot(input.default);
      if (input.type.startsWith("vec")) {
        try {
          typedArg.vecLen = Number.parseInt(input.type.substr(3));
        } catch (e) {
          console.log(`Error determining length of vector input type ${input.type} (${input.name})`);
        }
      }
      if (userArgs.length > index) {
        typedArg.value = userArgs[index];
        if (isVaryingRef(userArgs[index])) {
          typedArg.value = userArgs[index];
          typedArg.isVaryingRef = true;
          typedArg.isUniform = false;
        } else if (typedArg.type === "vec4") {
          if (!(typedArg.value.type === "GlslSource" || typedArg.value.getTexture)) {
            throw new Error("Arguments must be a texture or GlslSource");
          }
        }
        if (!typedArg.isVaryingRef && typeof userArgs[index] === "function") {
          typedArg.value = (context, props, batchId) => {
            try {
              const val = userArgs[index](props);
              if (typeof val === "number") {
                return val;
              } else {
                console.warn("function does not return a number", userArgs[index]);
              }
              return input.default;
            } catch (e) {
              console.warn("ERROR", e);
              return input.default;
            }
          };
          typedArg.isUniform = true;
        } else if (!typedArg.isVaryingRef && userArgs[index].constructor === Array) {
          typedArg.value = (context, props, batchId) => arrayUtils.getValue(userArgs[index])(props);
          typedArg.isUniform = true;
        } else if (!typedArg.isVaryingRef && typeof userArgs[index] === "string") {
          const expr = parseShaderExpr(userArgs[index]);
          if (expr) {
            typedArg.value = expr;
            typedArg.isShaderExpr = true;
            typedArg.isUniform = false;
          }
        }
      }
      if (startIndex < 0) ;
      else {
        if (typedArg.value && typedArg.value.transforms) {
          typedArg.isUniform = false;
        } else if (typedArg.type === "float" && typeof typedArg.value === "number") {
          typedArg.value = ensure_decimal_dot(typedArg.value);
        } else if (typedArg.type.startsWith("vec") && typeof typedArg.value === "object" && Array.isArray(typedArg.value)) {
          typedArg.isUniform = false;
          typedArg.value = `${typedArg.type}(${typedArg.value.map(ensure_decimal_dot).join(", ")})`;
        } else if (input.type === "sampler2D") {
          var x = typedArg.value;
          typedArg.value = () => x.getTexture();
          typedArg.isUniform = true;
        } else {
          if (typedArg.value.getTexture && input.type === "vec4") {
            var x1 = typedArg.value;
            typedArg.value = src(x1);
            typedArg.isUniform = false;
          }
        }
        if (typedArg.isUniform) {
          typedArg.name += startIndex;
        }
      }
      return typedArg;
    });
  }
  function generateGlsl$1(transforms, synth) {
    var shaderParams = {
      uniforms: [],
      // list of uniforms used in shader
      glslFunctions: [],
      // list of functions used in shader
      fragColor: "",
      wgsl: synth && synth.isWGSL
    };
    var gen = generateGlsl(transforms, shaderParams)("st");
    shaderParams.fragColor = gen;
    let uniforms = {};
    shaderParams.uniforms.forEach((uniform) => uniforms[uniform.name] = uniform);
    shaderParams.uniforms = Object.values(uniforms);
    return shaderParams;
  }
  function generateGlsl(transforms, shaderParams) {
    var fragColor = () => "";
    transforms.forEach((transform) => {
      var inputs = formatArguments(transform, shaderParams.uniforms.length);
      inputs.forEach((input) => {
        if (input.isUniform) {
          shaderParams.uniforms.push(input);
        }
      });
      if (!contains(transform, shaderParams.glslFunctions)) shaderParams.glslFunctions.push(transform);
      var f0 = fragColor;
      if (transform.transform.type === "src") {
        if (shaderParams.wgsl && inputs[0] && inputs[0].type === "sampler2D") {
          let texName = inputs[0].name;
          let sampName = "samp" + texName;
          fragColor = (uv) => {
            return `textureSample( ${texName}, ${sampName}, fract(${uv}))`;
          };
        } else {
          fragColor = (uv) => {
            return `${shaderString(uv, transform.name, inputs, shaderParams)}`;
          };
        }
      } else if (transform.transform.type === "coord") {
        fragColor = (uv) => `${f0(`${shaderString(uv, transform.name, inputs, shaderParams)}`)}`;
      } else if (transform.transform.type === "color") {
        fragColor = (uv) => `${shaderString(`${f0(uv)}`, transform.name, inputs, shaderParams)}`;
      } else if (transform.transform.type === "combine") {
        var f1 = inputs[0].value && inputs[0].value.transforms ? (uv) => `${generateGlsl(inputs[0].value.transforms, shaderParams)(uv)}` : inputs[0].isUniform ? () => inputs[0].name : () => inputs[0].value;
        fragColor = (uv) => `${shaderString(`${f0(uv)}, ${f1(uv)}`, transform.name, inputs.slice(1), shaderParams)}`;
      } else if (transform.transform.type === "combineCoord") {
        var f1 = inputs[0].value && inputs[0].value.transforms ? (uv) => `${generateGlsl(inputs[0].value.transforms, shaderParams)(uv)}` : inputs[0].isUniform ? () => inputs[0].name : () => inputs[0].value;
        fragColor = (uv) => `${f0(`${shaderString(`${uv}, ${f1(uv)}`, transform.name, inputs.slice(1), shaderParams)}`)}`;
      }
    });
    return fragColor;
  }
  function shaderString(uv, method, inputs, shaderParams) {
    const str = inputs.map((input) => {
      if (input.isUniform) {
        return shaderParams.wgsl ? "uf." + input.name : input.name;
      } else if (input.isVaryingRef && isVaryingRef(input.value)) {
        return getVaryingString(input.value, false);
      } else if (input.isShaderExpr) {
        return shaderParams.wgsl ? input.value.toWGSL() : input.value.toGLSL();
      } else if (input.value && input.value.transforms) {
        const srcCode = `${generateGlsl(input.value.transforms, shaderParams)("st")}`;
        if (input.type === "float") {
          const hasColorOutput = input.value.transforms.some((t) => {
            const type = t.transform.type;
            return type === "src" || type === "color" || type === "combine";
          });
          if (hasColorOutput) {
            return `(${srcCode}).r`;
          }
        }
        return srcCode;
      }
      return input.value;
    }).reduce((p, c) => `${p}, ${c}`, "");
    return `${method}(${uv}${str})`;
  }
  function contains(object, arr) {
    for (var i2 = 0; i2 < arr.length; i2++) {
      if (object.name == arr[i2].name) return true;
    }
    return false;
  }
  const utilityGlsl = {
    _luminance: {
      type: "util",
      glsl: `float _luminance(vec3 rgb){
      const vec3 W = vec3(0.2125, 0.7154, 0.0721);
      return dot(rgb, W);
    }`
    },
    _noise: {
      type: "util",
      glsl: `
    //	Simplex 3D Noise
    //	by Ian McEwan, Ashima Arts
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float _noise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0. + 0.0 * C
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

  // Permutations
    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

  // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }
    `
    },
    _rgbToHsv: {
      type: "util",
      glsl: `vec3 _rgbToHsv(vec3 c){
            vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

            float d = q.x - min(q.w, q.y);
            float e = 1.0e-10;
            return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }`
    },
    _hsvToRgb: {
      type: "util",
      glsl: `vec3 _hsvToRgb(vec3 c){
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }`
    }
  };
  const utilityWgsl = {
    _mod: {
      type: "util",
      wgsl: `fn _mod(x : f32, y: f32) -> f32 {
				return x - y * floor(x / y);
    }`
    },
    _luminance: {
      type: "util",
      wgsl: `fn _luminance(rgb : vec3<f32>) -> f32 {
      const  W = vec3<f32>(0.2125, 0.7154, 0.0721);
      return dot(rgb, W);
    }`
    },
    _noise: {
      type: "util",
      wgsl: `
  fn mod4v(x : vec4<f32>, y : f32) -> vec4<f32> {
  		return x - y * floor (x / y); // exact match for glsl
  		// return x % y; // wgsl uses trunc instead of floor.
  }

// vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  fn permute(xp :vec4<f32>)->vec4<f32> {
  		return  mod4v(((xp*34.0)+1.0)*xp, 289.0);
  	}

  fn taylorInvSqrt(r: vec4<f32>)->vec4<f32>{return 1.79284291400159 - 0.85373472095314 * r;}

  fn _noise(v: vec3<f32>)-> f32 {
    const  C = vec2<f32>(1.0/6.0, 1.0/3.0) ;
    const  D = vec4<f32>(0.0, 0.5, 1.0, 2.0);

  // First corner
    var i : vec3<f32> = floor(v + dot(v, C.yyy) );
    let x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
    let g = step(x0.yzx, x0.xyz);
    let l = 1.0 - g;
    let i1 = min( g.xyz, l.zxy );
    let i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0. + 0.0 * C
    let x1 = x0 - i1 + 1.0 * C.xxx;
    let x2 = x0 - i2 + 2.0 * C.xxx;
    let x3 = x0 - 1. + 3.0 * C.xxx;

  // Permutations
    i.x = i.x % 289.0;
    i.y = i.y % 289.0;
    i.z = i.z % 289.0;
    let p = permute( permute( permute(
               i.z + vec4<f32>(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4<f32>(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4<f32>(0.0, i1.x, i2.x, 1.0 ));

  // Gradients
  // ( N*N points uniformly over a square, mapped onto an octahedron.)
    let n_ = 1.0/7.0; // N=7
    let ns = n_ * D.wyz - D.xzx;

    let j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

    let x_ = floor(j * ns.z);
    let y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    let x = x_ *ns.x + ns.yyyy;
    let y = y_ *ns.x + ns.yyyy;
    let h = 1.0 - abs(x) - abs(y);

    let b0 = vec4<f32>( x.xy, y.xy );
    let b1 = vec4<f32>( x.zw, y.zw );

    let s0 = floor(b0)*2.0 + 1.0;
    let s1 = floor(b1)*2.0 + 1.0;
    let sh = -step(h, vec4<f32>(0.0));

    let a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    let a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    var p0 = vec3<f32>(a0.xy,h.x);
    var p1 = vec3<f32>(a0.zw,h.y);
    var p2 = vec3<f32>(a1.xy,h.z);
    var p3 = vec3<f32>(a1.zw,h.w);

  //Normalise gradients
    let norm = taylorInvSqrt(vec4<f32>(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    var m = max(0.6 - vec4<f32>(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4<f32>(0.0));
    m = m * m;

    return 42.0 * dot( m*m, vec4<f32>( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }`
    },
    _rgbToHsv: {
      type: "util",
      wgsl: `fn _rgbToHsv(c: vec3<f32>) -> vec3<f32> {
            let K = vec4<f32>(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
            let p = mix(vec4<f32>(c.bg, K.wz), vec4<f32>(c.gb, K.xy), step(c.b, c.g));
            let q = mix(vec4<f32>(p.xyw, c.r), vec4<f32>(c.r, p.yzx), step(p.x, c.r));

            let d = q.x - min(q.w, q.y);
            let e = 1.0e-10;
            return vec3<f32>(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
        }`
    },
    _hsvToRgb: {
      type: "util",
      wgsl: `fn _hsvToRgb(c: vec3<f32>) -> vec3<f32> {
        let K = vec4<f32>(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        let p : vec3<f32> = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        let cv : vec3<f32> = p - K.xxx;
        let cvmin =  vec3<f32>(0.0, 0.0, 0.0);
        let cvmax =  vec3<f32>(1.0, 1.0, 1.0);
        return  vec3<f32> (c.z * mix(K.xxx, clamp(cv, cvmin, cvmax), c.y));
    }`
    }
  };
  const wgslTypeLookup = {
    "src": { returnType: "vec4<f32>", args: [{ type: "vec2<f32>", name: "_st" }] },
    "coord": { returnType: "vec2<f32>", args: [{ type: "vec2<f32>", name: "_st" }] },
    "color": { returnType: "vec4<f32>", args: [{ type: "vec4<f32>", name: "_c0" }] },
    "combine": { returnType: "vec4<f32>", args: [{ type: "vec4<f32>", name: "_c0" }, { type: "vec4<f32>", name: "_c1" }] },
    "combineCoord": { returnType: "vec2<f32>", args: [{ type: "vec2<f32>", name: "_st" }, { type: "vec4<f32>", name: "_c0" }] }
  };
  function toWgslType(glslType) {
    const typeMap = {
      "float": "f32",
      "vec2": "vec2<f32>",
      "vec3": "vec3<f32>",
      "vec4": "vec4<f32>",
      "sampler2D": "texture_2d<f32>"
    };
    return typeMap[glslType] || glslType;
  }
  function wrapWgslFunction(transform) {
    const t = wgslTypeLookup[transform.transform.type];
    if (!t) return transform.transform.wgsl || "";
    const originalInputs = transform.transform.inputs || [];
    const firstTypeArg = t.args[0];
    const allArgs = [firstTypeArg, ...originalInputs.map((inp) => ({
      type: toWgslType(inp.type),
      name: inp.name
    }))];
    const args = allArgs.map((arg) => `${arg.name}: ${arg.type}`).join(", ");
    const body = transform.transform.wgsl || "";
    return `
fn ${transform.name}(${args}) -> ${t.returnType} {
    ${body}
}
`;
  }
  var GlslSource = function(obj) {
    this.transforms = [];
    this.transforms.push(obj);
    this.defaultOutput = obj.defaultOutput;
    this.synth = obj.synth;
    this.type = "GlslSource";
    this.defaultUniforms = obj.defaultUniforms;
    this.isWGSL = obj.synth.isWGSL;
    return this;
  };
  GlslSource.prototype.addTransform = function(obj) {
    this.transforms.push(obj);
  };
  function isGeometry(arg) {
    if (!arg) return false;
    if (Array.isArray(arg)) return true;
    if (arg.vertices) return true;
    return false;
  }
  function isConfig(arg) {
    if (!arg) return false;
    if (typeof arg !== "object") return false;
    if (Array.isArray(arg)) return false;
    if (arg.vertices) return false;
    return "level" in arg || "blend" in arg || "primitive" in arg || "sprite" in arg || "enabled" in arg;
  }
  function isOutput(arg) {
    return arg && typeof arg === "object" && "registerSprite" in arg;
  }
  GlslSource.prototype.out = function(arg1, arg2, arg3, arg4) {
    let output, geometry, config;
    if (isGeometry(arg1)) {
      output = this.defaultOutput;
      geometry = arg1;
      config = isConfig(arg2) ? arg2 : {};
      if (typeof arg2 === "number") {
        config = { level: arg2, blend: arg3 || "normal" };
      }
    } else if (isOutput(arg1) || arg1 === void 0 || arg1 === null) {
      output = arg1 || this.defaultOutput;
      if (isGeometry(arg2)) {
        geometry = arg2;
        config = isConfig(arg3) ? arg3 : {};
        if (typeof arg3 === "number") {
          config = { level: arg3, blend: arg4 || "normal" };
        }
      } else if (isConfig(arg2)) {
        geometry = null;
        config = arg2;
      } else if (arg2 === null && isConfig(arg3)) {
        geometry = null;
        config = arg3;
      } else {
        geometry = null;
        config = {};
      }
    } else {
      output = arg1 || this.defaultOutput;
      geometry = null;
      config = {};
    }
    const level = config.level !== void 0 ? config.level : 0;
    const blend = config.blend || "normal";
    const primitive = config.primitive || "triangles";
    const sprite = config.sprite || null;
    const enabled = config.enabled !== void 0 ? config.enabled : true;
    if (output) try {
      var glsl = this.glsl(output);
      this.synth.currentFunctions = [];
      if (output.sprites && output.sprites.has(level) && output.defaultPositionBuffer) {
        const oldSprite = output.sprites.get(level);
        if (oldSprite.positionBuffer && oldSprite.positionBuffer !== output.defaultPositionBuffer) {
          oldSprite.positionBuffer.destroy();
        }
      }
      output.registerSprite(level, {
        passes: glsl,
        vertexData: geometry,
        blendMode: blend,
        primitive,
        sprite,
        enabled
      });
    } catch (error) {
      console.warn("shader could not compile", error);
    }
  };
  GlslSource.prototype.glsl = function() {
    var passes = [];
    var transforms = [];
    this.transforms.forEach((transform) => {
      if (transform.transform.type === "renderpass") {
        console.warn("no support for renderpass");
      } else {
        transforms.push(transform);
      }
    });
    if (transforms.length > 0) passes.push(this.compile(transforms));
    return passes;
  };
  GlslSource.prototype.compile = function(transforms) {
    var shaderInfo = generateGlsl$1(transforms, this.synth);
    var uniforms = {};
    shaderInfo.uniforms.forEach((uniform) => {
      uniforms[uniform.name] = uniform.value;
    });
    let frag;
    const isWGSL = this.isWGSL || this.synth && this.synth.isWGSL;
    if (isWGSL) {
      frag = `
var<private> v_position: vec3<f32>;
var<private> v_normal: vec3<f32>;
var<private> v_worldNormal: vec3<f32>;
var<private> v_tangent: vec3<f32>;
var<private> v_bitangent: vec3<f32>;
var<private> v_viewDir: vec3<f32>;
var<private> v_depth: f32;
var<private> v_color: vec4<f32>;

${Object.values(utilityWgsl).map((transform) => {
        return `
            ${transform.wgsl}
          `;
      }).join("")}

${shaderInfo.glslFunctions.map((transform) => {
        if (isWGSL && transform.transform.strange) return "";
        return wrapWgslFunction(transform);
      }).join("")}

  @fragment
  fn main(ourIn: VertexOutput) -> @location(0) vec4<f32> {
    let c: vec4<f32> = vec4<f32>(1.0, 0.0, 0.0, 1.0);
    // Sprite grid UV picking (like GLSL version)
    var st: vec2<f32>;
    // Flip X to correct mirroring in WGSL
    let texcoord = vec2<f32>(1.0 - ourIn.texcoord.x, ourIn.texcoord.y);
    if (u_spriteGrid.x > 1.0 || u_spriteGrid.y > 1.0) {
      // faceId maps to cell in row-major order (left-to-right, top-to-bottom)
      let cellX = ourIn.faceId % u_spriteGrid.x;
      let cellY = floor(ourIn.faceId / u_spriteGrid.x);
      let cellSize = vec2<f32>(1.0 / u_spriteGrid.x, 1.0 / u_spriteGrid.y);
      st = texcoord * cellSize + vec2<f32>(cellX, cellY) * cellSize;
    } else {
      // Fallback to u_spriteUV for single sprite picking
      st = u_spriteUV.xy + texcoord * (u_spriteUV.zw - u_spriteUV.xy);
    }
    // Copy varyings to module-scope private variables
    v_position = ourIn.v_position;
    v_normal = ourIn.v_normal;
    v_worldNormal = ourIn.v_worldNormal;
    v_tangent = ourIn.v_tangent;
    v_bitangent = ourIn.v_bitangent;
    v_viewDir = ourIn.v_viewDir;
    v_depth = ourIn.v_depth;
    v_color = ourIn.v_color;
    // Define _ix for shader expressions (instance index)
    let _ix = ourIn.v_instanceId;
    return ${shaderInfo.fragColor};
  }
`;
    } else {
      frag = `
  precision ${this.defaultOutput.precision} float;
  ${Object.values(shaderInfo.uniforms).map((uniform) => {
        let type = uniform.type;
        switch (uniform.type) {
          case "texture":
            type = "sampler2D";
            break;
        }
        return `
      uniform ${type} ${uniform.name};`;
      }).join("")}
  uniform float time;
  uniform vec2 resolution;
  varying vec2 uv;
  varying float v_faceId;
  varying float v_instanceId;

  // Vertex data from vertex shader (for 3D geometry)
  varying vec3 v_position;
  varying vec3 v_normal;
  varying vec3 v_worldNormal;
  varying vec3 v_tangent;
  varying vec3 v_bitangent;
  varying vec3 v_viewDir;
  varying float v_depth;
  varying vec4 v_color;

  uniform sampler2D prevBuffer;
  uniform vec4 u_spriteUV;  // x=uMin, y=vMin, z=uMax, w=vMax (fallback when no faceId)
  uniform vec2 u_spriteGrid;  // cols, rows for faceId-based sprite picking

  ${Object.values(utilityGlsl).map((transform) => {
        return `
            ${transform.glsl}
          `;
      }).join("")}

  ${shaderInfo.glslFunctions.map((transform) => {
        return `
            ${transform.transform.glsl}
          `;
      }).join("")}

  void main () {
    vec2 st;
    // If using sprite grid (cols > 1 or rows > 1), use faceId to pick cell
    if (u_spriteGrid.x > 1.0 || u_spriteGrid.y > 1.0) {
      // faceId maps to cell in row-major order (left-to-right, top-to-bottom)
      float cellX = mod(v_faceId, u_spriteGrid.x);
      float cellY = floor(v_faceId / u_spriteGrid.x);
      vec2 cellSize = vec2(1.0 / u_spriteGrid.x, 1.0 / u_spriteGrid.y);
      st = uv * cellSize + vec2(cellX, cellY) * cellSize;
    } else {
      // Fallback to u_spriteUV for single sprite picking
      st = u_spriteUV.xy + uv * (u_spriteUV.zw - u_spriteUV.xy);
    }

    vec4 c = ${shaderInfo.fragColor};
    gl_FragColor = c;
  }
  `;
    }
    return {
      frag,
      uniforms: Object.assign({}, this.defaultUniforms, uniforms)
    };
  };
  const BLEND_MODES = {
    normal: {
      enable: true,
      func: {
        srcRGB: "src alpha",
        srcAlpha: 1,
        dstRGB: "one minus src alpha",
        dstAlpha: "one minus src alpha"
      }
    },
    add: {
      enable: true,
      func: {
        srcRGB: "src alpha",
        srcAlpha: 1,
        dstRGB: "one",
        dstAlpha: "one"
      }
    },
    multiply: {
      enable: true,
      func: {
        srcRGB: "dst color",
        srcAlpha: 1,
        dstRGB: "zero",
        dstAlpha: "one"
      }
    },
    screen: {
      enable: true,
      func: {
        srcRGB: "one",
        srcAlpha: 1,
        dstRGB: "one minus src color",
        dstAlpha: "one"
      }
    }
  };
  var Output = function({ regl, precision, label = "", chanNum, hydraSynth, width, height }) {
    this.regl = regl;
    this.precision = precision;
    this.label = label;
    this.chanNum = chanNum;
    this.hydraSynth = hydraSynth;
    this.defaultPositionBuffer = this.regl.buffer([
      [-2, 0, 0],
      [0, -2, 0],
      [2, 2, 0]
    ]);
    this.positionBuffer = this.defaultPositionBuffer;
    this.sprites = /* @__PURE__ */ new Map();
    this.draw = () => {
    };
    this.init();
    this.pingPongIndex = 0;
    this.hasDepthBuffer = false;
    this.fbos = Array(2).fill().map(() => this.regl.framebuffer({
      color: this.regl.texture({
        mag: "nearest",
        width,
        height,
        format: "rgba"
      }),
      depthStencil: false
    }));
  };
  Output.prototype.resize = function(width, height) {
    if (!width || !height || width <= 0 || height <= 0) {
      console.warn(`[Output] resize called with invalid dimensions: ${width}x${height}`);
      return;
    }
    this.fbos.forEach((fbo) => {
      fbo.resize(width, height);
    });
  };
  Output.prototype.enableDepthBuffer = function() {
    if (this.hasDepthBuffer) return;
    const width = this.fbos[0].width;
    const height = this.fbos[0].height;
    this.fbos.forEach((fbo) => fbo.destroy());
    this.fbos = Array(2).fill().map(() => this.regl.framebuffer({
      color: this.regl.texture({
        mag: "nearest",
        width,
        height,
        format: "rgba"
      }),
      depth: true
    }));
    this.hasDepthBuffer = true;
  };
  Output.prototype.getCurrent = function() {
    return this.fbos[this.pingPongIndex];
  };
  Output.prototype.getTexture = function() {
    var index = this.pingPongIndex ? 0 : 1;
    return this.fbos[index];
  };
  Output.prototype.init = function() {
    this.transformIndex = 0;
    this.fragHeader = `
  precision ${this.precision} float;

  uniform float time;
  varying vec2 uv;
  `;
    this.fragBody = ``;
    this.vert = `
  precision ${this.precision} float;
  attribute vec3 position;
  varying vec2 uv;
  varying float v_faceId;
  varying float v_instanceId;

  // Vertex data for fragment shader (default values for fullscreen quad)
  varying vec3 v_position;
  varying vec3 v_normal;
  varying vec3 v_worldNormal;
  varying vec3 v_tangent;
  varying vec3 v_bitangent;
  varying vec3 v_viewDir;
  varying float v_depth;

  void main () {
    uv = position.xy;
    v_faceId = 0.0;
    v_instanceId = 0.0;

    // Default vertex data for fullscreen quad
    v_position = vec3(position.xy * 2.0 - 1.0, 0.0);
    v_normal = vec3(0.0, 0.0, 1.0);
    v_worldNormal = vec3(0.0, 0.0, 1.0);
    v_tangent = vec3(1.0, 0.0, 0.0);
    v_bitangent = vec3(0.0, 1.0, 0.0);
    v_viewDir = vec3(0.0, 0.0, 1.0);
    v_depth = 1.0;

    gl_Position = vec4(2.0 * position.xy - 1.0, 0, 1);
  }`;
    this.attributes = {
      position: this.positionBuffer
    };
    this.uniforms = {
      time: this.regl.prop("time"),
      resolution: this.regl.prop("resolution")
    };
    this.frag = `
       ${this.fragHeader}

      void main () {
        vec4 c = vec4(0, 0, 0, 0);
        vec2 st = uv;
        ${this.fragBody}
        gl_FragColor = c;
      }
  `;
    this.copyCommand = this.regl({
      frag: `
      precision ${this.precision} float;
      uniform sampler2D source;
      varying vec2 uv;
      void main () {
        gl_FragColor = texture2D(source, uv);
      }
    `,
      vert: this.vert,
      attributes: {
        position: this.defaultPositionBuffer
      },
      uniforms: {
        source: this.regl.prop("source")
      },
      count: 3,
      depth: { enable: false }
    });
    return this;
  };
  function reshapeToVec3(flatArray, is3D = false) {
    const len = flatArray.length;
    const stride = is3D ? 3 : 2;
    const verts = [];
    for (let i2 = 0; i2 < len; i2 += stride) {
      if (is3D) {
        verts.push([flatArray[i2], flatArray[i2 + 1], flatArray[i2 + 2]]);
      } else {
        verts.push([flatArray[i2], flatArray[i2 + 1], 0]);
      }
    }
    return verts;
  }
  function normalizeVertexOption(value, defaultValue) {
    if (value === void 0 || value === null) return defaultValue;
    return value;
  }
  Output.prototype.registerSprite = function(spriteLevel, config) {
    const { passes, vertexData, blendMode = "normal", vertexOptions = null, primitive = "triangles", sprite = null, enabled = true } = config;
    const pass = passes[0];
    const self2 = this;
    let rawVerts = null;
    let vertexSource = null;
    let has3D = false;
    if (vertexData instanceof VertexSource) {
      vertexSource = vertexData;
      rawVerts = vertexData.vertices;
      has3D = vertexData.is3D || false;
    } else if (vertexData && Array.isArray(vertexData)) {
      rawVerts = vertexData;
    }
    if (has3D) {
      this.enableDepthBuffer();
    }
    let positionBuffer, uvBuffer, faceIdBuffer, normalBuffer, tangentBuffer, colorBuffer, vertexCount;
    let bounds = { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    let hasExplicitUVs = false;
    let hasFaceIds = false;
    let hasNormals = false;
    let hasTangents = false;
    let hasColors = false;
    if (rawVerts && rawVerts.length >= 6) {
      const verts = reshapeToVec3(rawVerts, has3D);
      positionBuffer = this.regl.buffer(verts);
      vertexCount = verts.length;
      if (vertexSource && vertexSource.uvs && vertexSource.uvs.length > 0) {
        hasExplicitUVs = true;
        const uvData = [];
        for (let i2 = 0; i2 < vertexSource.uvs.length; i2 += 2) {
          uvData.push([vertexSource.uvs[i2], vertexSource.uvs[i2 + 1]]);
        }
        uvBuffer = this.regl.buffer(uvData);
      } else {
        bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
        for (const v2 of verts) {
          bounds.minX = Math.min(bounds.minX, v2[0]);
          bounds.maxX = Math.max(bounds.maxX, v2[0]);
          bounds.minY = Math.min(bounds.minY, v2[1]);
          bounds.maxY = Math.max(bounds.maxY, v2[1]);
        }
      }
      if (vertexSource && vertexSource.faceIds && vertexSource.faceIds.length > 0) {
        hasFaceIds = true;
        faceIdBuffer = this.regl.buffer(vertexSource.faceIds.map((id) => [id]));
      }
      if (vertexSource && vertexSource.normals && vertexSource.normals.length > 0) {
        hasNormals = true;
        const normalData = [];
        for (let i2 = 0; i2 < vertexSource.normals.length; i2 += 3) {
          normalData.push([vertexSource.normals[i2], vertexSource.normals[i2 + 1], vertexSource.normals[i2 + 2]]);
        }
        normalBuffer = this.regl.buffer(normalData);
      }
      if (vertexSource && vertexSource.tangents && vertexSource.tangents.length > 0) {
        hasTangents = true;
        const tangentData = [];
        for (let i2 = 0; i2 < vertexSource.tangents.length; i2 += 4) {
          tangentData.push([vertexSource.tangents[i2], vertexSource.tangents[i2 + 1], vertexSource.tangents[i2 + 2], vertexSource.tangents[i2 + 3]]);
        }
        tangentBuffer = this.regl.buffer(tangentData);
      }
      if (vertexSource && vertexSource.colors && vertexSource.colors.length > 0) {
        hasColors = true;
        const colorData = [];
        for (let i2 = 0; i2 < vertexSource.colors.length; i2 += 4) {
          colorData.push([vertexSource.colors[i2], vertexSource.colors[i2 + 1], vertexSource.colors[i2 + 2], vertexSource.colors[i2 + 3]]);
        }
        colorBuffer = this.regl.buffer(colorData);
      }
    }
    let hasInstancing = false;
    let instanceCount = 0;
    let instanceOffsetBuffer = null;
    let instanceIdBuffer = null;
    let instanceRotationBuffer = null;
    let instanceScaleBuffer = null;
    if (vertexSource && vertexSource.instancePositions && vertexSource.instanceCount > 0) {
      hasInstancing = true;
      instanceCount = vertexSource.instanceCount;
      const baseVerts = vertexSource.vertices ? vertexSource.vertices.length / 3 : 0;
      const totalVerts = baseVerts * instanceCount;
      console.log(`[hydra-vertex] Instancing: ${instanceCount} instances × ${baseVerts} vertices = ${totalVerts} total vertices`);
      const offsetData = [];
      for (let i2 = 0; i2 < vertexSource.instancePositions.length; i2 += 3) {
        offsetData.push([
          vertexSource.instancePositions[i2],
          vertexSource.instancePositions[i2 + 1],
          vertexSource.instancePositions[i2 + 2]
        ]);
      }
      instanceOffsetBuffer = this.regl.buffer(offsetData);
      const idData = [];
      for (let i2 = 0; i2 < instanceCount; i2++) {
        idData.push([i2]);
      }
      instanceIdBuffer = this.regl.buffer(idData);
      if (vertexSource.instanceRotations) {
        const rotData = [];
        for (let i2 = 0; i2 < vertexSource.instanceRotations.length; i2 += 3) {
          rotData.push([
            vertexSource.instanceRotations[i2],
            vertexSource.instanceRotations[i2 + 1],
            vertexSource.instanceRotations[i2 + 2]
          ]);
        }
        instanceRotationBuffer = this.regl.buffer(rotData);
      }
      if (vertexSource.instanceScales) {
        const scaleData = [];
        for (let i2 = 0; i2 < vertexSource.instanceScales.length; i2 += 3) {
          scaleData.push([
            vertexSource.instanceScales[i2],
            vertexSource.instanceScales[i2 + 1],
            vertexSource.instanceScales[i2 + 2]
          ]);
        }
        instanceScaleBuffer = this.regl.buffer(scaleData);
      }
    }
    if (!rawVerts) {
      positionBuffer = this.defaultPositionBuffer;
      vertexCount = 3;
    }
    const hasChainedTransforms = vertexSource && vertexSource.hasTransforms;
    const hasVertexOptions = rawVerts && vertexOptions && (vertexOptions.scale !== void 0 || vertexOptions.offset !== void 0 || vertexOptions.rotation !== void 0);
    const uniforms = Object.assign({}, pass.uniforms, {
      prevBuffer: () => self2.fbos[self2.pingPongIndex],
      resolution: this.regl.prop("resolution")
    });
    if (sprite && sprite.getUVBounds) {
      uniforms.u_spriteUV = () => {
        const bounds2 = sprite.getUVBounds();
        return [bounds2.uMin, bounds2.vMin, bounds2.uMax, bounds2.vMax];
      };
    } else {
      uniforms.u_spriteUV = [0, 0, 1, 1];
    }
    if (sprite && sprite.cols && sprite.rows) {
      uniforms.u_spriteGrid = [sprite.cols, sprite.rows];
    } else {
      uniforms.u_spriteGrid = [1, 1];
    }
    if (rawVerts) {
      uniforms.u_boundsMin = [bounds.minX, bounds.minY];
      uniforms.u_boundsMax = [bounds.maxX, bounds.maxY];
    }
    if (hasVertexOptions) {
      const scaleOpt = normalizeVertexOption(vertexOptions.scale, [1, 1]);
      uniforms.u_scale = (context, props) => {
        const val = typeof scaleOpt === "function" ? scaleOpt() : scaleOpt;
        if (typeof val === "number") return [val, val];
        return val;
      };
      const offsetOpt = normalizeVertexOption(vertexOptions.offset, [0, 0]);
      uniforms.u_offset = (context, props) => {
        const val = typeof offsetOpt === "function" ? offsetOpt() : offsetOpt;
        return val;
      };
      const rotationOpt = normalizeVertexOption(vertexOptions.rotation, 0);
      uniforms.u_rotation = (context, props) => {
        const val = typeof rotationOpt === "function" ? rotationOpt() : rotationOpt;
        return val;
      };
    }
    let vert;
    let vertexUniforms = {};
    if (rawVerts) {
      if (hasChainedTransforms) {
        const generated = generateVertexGlsl(vertexSource, this.precision, {
          useExplicitUVs: hasExplicitUVs,
          useFaceIds: hasFaceIds,
          useNormals: hasNormals,
          useTangents: hasTangents,
          useColors: hasColors,
          useInstancing: hasInstancing,
          useInstanceRotation: hasInstancing && !!instanceRotationBuffer,
          useInstanceScale: hasInstancing && !!instanceScaleBuffer
        });
        vert = generated.glsl;
        vertexUniforms = generated.uniforms;
      } else if (hasVertexOptions) {
        const uvAttrDecl = hasExplicitUVs ? "attribute vec2 texcoord;" : "";
        const faceIdAttrDecl = hasFaceIds ? "attribute float faceId;" : "";
        const uvCode = hasExplicitUVs ? "uv = texcoord;" : "uv = (position.xy - u_boundsMin) / (u_boundsMax - u_boundsMin);";
        const faceIdCode = hasFaceIds ? "v_faceId = faceId;" : "v_faceId = 0.0;";
        vert = `
      precision ${this.precision} float;
      attribute vec3 position;
      ${uvAttrDecl}
      ${faceIdAttrDecl}
      varying vec2 uv;
      varying float v_faceId;

      // Vertex data for fragment shader
      varying vec3 v_position;
      varying vec3 v_normal;
      varying vec3 v_viewDir;
      varying float v_depth;

      uniform vec2 u_scale;
      uniform vec2 u_offset;
      uniform float u_rotation;
      uniform vec2 u_boundsMin;
      uniform vec2 u_boundsMax;

      void main () {
        // UV ${hasExplicitUVs ? "from explicit attribute" : "normalized to shape bounds"}
        ${uvCode}
        ${faceIdCode}

        // Apply transforms
        vec2 pos = position.xy * u_scale;

        // Rotation around origin
        float c = cos(u_rotation);
        float s = sin(u_rotation);
        pos = vec2(pos.x * c - pos.y * s, pos.x * s + pos.y * c);

        // Offset
        pos += u_offset;

        // Default vertex data for 2D geometry
        v_position = vec3(pos, 0.0);
        v_normal = vec3(0.0, 0.0, 1.0);
        v_viewDir = vec3(0.0, 0.0, 1.0);
        v_depth = 1.0;

        gl_Position = vec4(pos, 0.0, 1.0);
        gl_PointSize = 2.0;
      }`;
      } else {
        const uvAttrDecl = hasExplicitUVs ? "attribute vec2 texcoord;" : "";
        const faceIdAttrDecl = hasFaceIds ? "attribute float faceId;" : "";
        const normalAttrDecl = hasNormals ? "attribute vec3 normal;" : "";
        const uvCode = hasExplicitUVs ? "uv = texcoord;" : "uv = (position.xy - u_boundsMin) / (u_boundsMax - u_boundsMin);";
        const faceIdCode = hasFaceIds ? "v_faceId = faceId;" : "v_faceId = 0.0;";
        const normalCode = hasNormals ? "v_normal = normalize(normal);" : "v_normal = vec3(0.0, 0.0, 1.0);";
        const positionCode = has3D ? "v_position = position;" : "v_position = vec3(position.xy, 0.0);";
        const glPositionCode = has3D ? `float aspect = resolution.x / resolution.y;
        gl_Position = vec4(position.x / aspect, position.y, position.z * 0.1, 1.0);` : "gl_Position = vec4(position.xy, 0.0, 1.0);";
        vert = `
      precision ${this.precision} float;
      attribute vec3 position;
      ${uvAttrDecl}
      ${faceIdAttrDecl}
      ${normalAttrDecl}
      varying vec2 uv;
      varying float v_faceId;

      // Vertex data for fragment shader
      varying vec3 v_position;
      varying vec3 v_normal;
      varying vec3 v_worldNormal;
      varying vec3 v_viewDir;
      varying float v_depth;

      uniform vec2 u_boundsMin;
      uniform vec2 u_boundsMax;
      uniform vec2 resolution;

      void main () {
        // UV ${hasExplicitUVs ? "from explicit attribute" : "normalized to shape bounds"}
        ${uvCode}
        ${faceIdCode}

        // Vertex data
        ${positionCode}
        ${normalCode}
        v_worldNormal = v_normal;
        v_viewDir = vec3(0.0, 0.0, 1.0);
        v_depth = 1.0;

        ${glPositionCode}
        gl_PointSize = 2.0;
      }`;
      }
    } else {
      vert = this.vert;
    }
    Object.assign(uniforms, vertexUniforms);
    const attributes = {
      position: positionBuffer
    };
    if (hasExplicitUVs && uvBuffer) {
      attributes.texcoord = uvBuffer;
    }
    if (hasFaceIds && faceIdBuffer) {
      attributes.faceId = faceIdBuffer;
    }
    if (hasNormals && normalBuffer) {
      attributes.normal = normalBuffer;
    }
    if (hasTangents && tangentBuffer) {
      attributes.tangent = tangentBuffer;
    }
    if (hasColors && colorBuffer) {
      attributes.color = colorBuffer;
    }
    if (hasInstancing && instanceOffsetBuffer) {
      attributes.instanceOffset = {
        buffer: instanceOffsetBuffer,
        divisor: 1
      };
      attributes.instanceId = {
        buffer: instanceIdBuffer,
        divisor: 1
      };
      if (instanceRotationBuffer) {
        attributes.instanceRotation = {
          buffer: instanceRotationBuffer,
          divisor: 1
        };
      }
      if (instanceScaleBuffer) {
        attributes.instanceScale = {
          buffer: instanceScaleBuffer,
          divisor: 1
        };
      }
    }
    const drawConfig = {
      frag: pass.frag,
      vert,
      attributes,
      uniforms,
      count: vertexCount,
      primitive,
      blend: BLEND_MODES[blendMode] || BLEND_MODES.normal,
      depth: { enable: has3D, func: "less" }
    };
    if (hasInstancing) {
      drawConfig.instances = instanceCount;
      if (instanceCount > 5e3) {
        console.warn(`[hydra-vertex] ⚠️ High instance count: ${instanceCount}. This may cause GPU performance issues.`);
      }
    }
    let drawCommand;
    try {
      drawCommand = this.regl(drawConfig);
    } catch (err) {
      console.error("[hydra-vertex] ❌ Shader compilation failed!");
      console.error("[hydra-vertex] Error:", err.message);
      if (err.message.includes("ERROR:")) {
        console.error("[hydra-vertex] This is usually caused by invalid shader expressions or unsupported GLSL operations.");
      }
      console.group("[hydra-vertex] Shader sources (for debugging):");
      console.log("Vertex shader (first 500 chars):", vert.substring(0, 500) + "...");
      console.log("Fragment shader (first 500 chars):", pass.frag.substring(0, 500) + "...");
      console.groupEnd();
      return;
    }
    const spriteConfig = {
      drawCommand,
      positionBuffer,
      uvBuffer,
      faceIdBuffer,
      normalBuffer,
      tangentBuffer,
      colorBuffer,
      instanceOffsetBuffer,
      instanceIdBuffer,
      instanceRotationBuffer,
      instanceScaleBuffer,
      blendMode,
      has3D,
      hasInstancing,
      instanceCount,
      enabled
    };
    if (vertexSource && vertexSource._animTimeFunc) {
      spriteConfig.animation = {
        skeleton: vertexSource._skeleton,
        animations: vertexSource._animations,
        clipName: vertexSource._animClip,
        timeFunc: vertexSource._animTimeFunc,
        originalVerts: vertexSource._originalVerts || vertexSource.vertices,
        originalNormals: vertexSource._originalNormals || vertexSource.normals,
        joints: vertexSource.joints,
        weights: vertexSource.weights,
        gltf: vertexSource._gltf,
        normCenter: vertexSource._normCenter,
        // For denormalize/renormalize during skinning
        normScale: vertexSource._normScale,
        is3D: has3D
      };
    }
    this.sprites.set(spriteLevel, spriteConfig);
  };
  Output.prototype.clearSprites = function() {
    for (const [level, sprite] of this.sprites) {
      if (sprite.positionBuffer && sprite.positionBuffer !== this.defaultPositionBuffer) {
        sprite.positionBuffer.destroy();
      }
      if (sprite.uvBuffer) {
        sprite.uvBuffer.destroy();
      }
      if (sprite.faceIdBuffer) {
        sprite.faceIdBuffer.destroy();
      }
      if (sprite.normalBuffer) {
        sprite.normalBuffer.destroy();
      }
      if (sprite.tangentBuffer) {
        sprite.tangentBuffer.destroy();
      }
      if (sprite.colorBuffer) {
        sprite.colorBuffer.destroy();
      }
      if (sprite.instanceOffsetBuffer) {
        sprite.instanceOffsetBuffer.destroy();
      }
      if (sprite.instanceIdBuffer) {
        sprite.instanceIdBuffer.destroy();
      }
      if (sprite.instanceRotationBuffer) {
        sprite.instanceRotationBuffer.destroy();
      }
      if (sprite.instanceScaleBuffer) {
        sprite.instanceScaleBuffer.destroy();
      }
    }
    this.sprites.clear();
  };
  Output.prototype.removeSprite = function(level) {
    if (this.sprites.has(level)) {
      const sprite = this.sprites.get(level);
      if (sprite.positionBuffer && sprite.positionBuffer !== this.defaultPositionBuffer) {
        sprite.positionBuffer.destroy();
      }
      if (sprite.uvBuffer) {
        sprite.uvBuffer.destroy();
      }
      if (sprite.faceIdBuffer) {
        sprite.faceIdBuffer.destroy();
      }
      if (sprite.normalBuffer) {
        sprite.normalBuffer.destroy();
      }
      if (sprite.tangentBuffer) {
        sprite.tangentBuffer.destroy();
      }
      if (sprite.colorBuffer) {
        sprite.colorBuffer.destroy();
      }
      if (sprite.instanceOffsetBuffer) {
        sprite.instanceOffsetBuffer.destroy();
      }
      if (sprite.instanceIdBuffer) {
        sprite.instanceIdBuffer.destroy();
      }
      if (sprite.instanceRotationBuffer) {
        sprite.instanceRotationBuffer.destroy();
      }
      if (sprite.instanceScaleBuffer) {
        sprite.instanceScaleBuffer.destroy();
      }
      this.sprites.delete(level);
    }
  };
  Output.prototype.enableSprite = function(level, enabled = true) {
    if (this.sprites.has(level)) {
      this.sprites.get(level).enabled = enabled;
    }
  };
  Output.prototype.disableSprite = function(level) {
    this.enableSprite(level, false);
  };
  Output.prototype.render = function(passes) {
    if (this.sprites.has(0)) {
      const oldSprite = this.sprites.get(0);
      if (oldSprite.positionBuffer && oldSprite.positionBuffer !== this.defaultPositionBuffer) {
        oldSprite.positionBuffer.destroy();
      }
      if (oldSprite.uvBuffer) {
        oldSprite.uvBuffer.destroy();
      }
      if (oldSprite.faceIdBuffer) {
        oldSprite.faceIdBuffer.destroy();
      }
      if (oldSprite.normalBuffer) {
        oldSprite.normalBuffer.destroy();
      }
      if (oldSprite.tangentBuffer) {
        oldSprite.tangentBuffer.destroy();
      }
      if (oldSprite.colorBuffer) {
        oldSprite.colorBuffer.destroy();
      }
      if (oldSprite.instanceOffsetBuffer) {
        oldSprite.instanceOffsetBuffer.destroy();
      }
      if (oldSprite.instanceIdBuffer) {
        oldSprite.instanceIdBuffer.destroy();
      }
      if (oldSprite.instanceRotationBuffer) {
        oldSprite.instanceRotationBuffer.destroy();
      }
      if (oldSprite.instanceScaleBuffer) {
        oldSprite.instanceScaleBuffer.destroy();
      }
    }
    this.registerSprite(0, { passes, vertexData: null, blendMode: "normal" });
    const self2 = this;
    this.draw = function(props) {
      self2._renderSprites(props);
    };
  };
  Output.prototype._renderSprites = function(props) {
    if (this.sprites.size === 0) {
      this.pingPongIndex = this.pingPongIndex ? 0 : 1;
      const targetFbo2 = this.fbos[this.pingPongIndex];
      this.regl.clear({
        color: [0, 0, 0, 1],
        depth: 1,
        framebuffer: targetFbo2
      });
      return;
    }
    const levels = Array.from(this.sprites.keys()).sort((a, b) => a - b);
    this.pingPongIndex = this.pingPongIndex ? 0 : 1;
    const targetFbo = this.fbos[this.pingPongIndex];
    const prevFbo = this.fbos[this.pingPongIndex ? 0 : 1];
    const level0Sprite = this.sprites.get(0);
    const hasLevel0 = levels.includes(0) && level0Sprite && level0Sprite.enabled !== false;
    const needs3D = Array.from(this.sprites.values()).some((s) => s.has3D);
    if (!hasLevel0) {
      this.regl.clear({
        color: [0, 0, 0, 0],
        depth: needs3D ? 1 : void 0,
        framebuffer: targetFbo
      });
      if (this.copyCommand) {
        targetFbo.use(() => {
          this.copyCommand({ source: prevFbo });
        });
      }
    } else {
      this.regl.clear({
        color: [0, 0, 0, 1],
        depth: needs3D ? 1 : void 0,
        framebuffer: targetFbo
      });
    }
    for (let i2 = 0; i2 < levels.length; i2++) {
      const level = levels[i2];
      const sprite = this.sprites.get(level);
      if (sprite.enabled === false) continue;
      if (sprite.animation) {
        const anim = sprite.animation;
        const time = typeof anim.timeFunc === "function" ? anim.timeFunc() : 0;
        const clipName = typeof anim.clipName === "function" ? anim.clipName() : anim.clipName;
        const clip = anim.animations.find((a) => a.name === clipName) || anim.animations[0];
        const loopedTime = clip ? time % clip.duration : time;
        const skinningMatrices = computeSkinningMatrices(
          anim.skeleton,
          anim.animations,
          clipName,
          loopedTime,
          anim.gltf,
          anim.normCenter,
          anim.normScale
        );
        if (skinningMatrices) {
          const skinned = applySkinning(
            anim.originalVerts,
            anim.originalNormals,
            anim.joints,
            anim.weights,
            skinningMatrices
          );
          const skinnedVec3 = [];
          for (let j = 0; j < skinned.vertices.length; j += 3) {
            skinnedVec3.push([skinned.vertices[j], skinned.vertices[j + 1], skinned.vertices[j + 2]]);
          }
          sprite.positionBuffer(skinnedVec3);
          if (sprite.normalBuffer && skinned.normals) {
            const skinnedNormals = [];
            for (let j = 0; j < skinned.normals.length; j += 3) {
              skinnedNormals.push([skinned.normals[j], skinned.normals[j + 1], skinned.normals[j + 2]]);
            }
            sprite.normalBuffer(skinnedNormals);
          }
        }
      }
      targetFbo.use(() => {
        sprite.drawCommand(props);
      });
    }
  };
  Output.prototype.tick = function(props) {
    this._renderSprites(props);
  };
  const lightingFunctions = [
    {
      name: "diffuse",
      type: "color",
      inputs: [
        { type: "float", name: "lx", default: 0 },
        { type: "float", name: "ly", default: 1 },
        { type: "float", name: "lz", default: 0 },
        { type: "float", name: "ambient", default: 0.2 }
      ],
      glsl: `
      vec3 lightDir = normalize(vec3(lx, ly, lz));
      vec3 normal = normalize(v_worldNormal);
      float diff = max(0.0, dot(normal, lightDir));
      float lighting = ambient + (1.0 - ambient) * diff;
      return vec4(_c0.rgb * lighting, _c0.a);`,
      wgsl: `
      let lightDir = normalize(vec3<f32>(lx, ly, lz));
      let normal = normalize(v_worldNormal);
      let diff = max(0.0, dot(normal, lightDir));
      let lighting = ambient + (1.0 - ambient) * diff;
      return vec4<f32>(_c0.rgb * lighting, _c0.a);`
    },
    {
      name: "specular",
      type: "color",
      inputs: [
        { type: "float", name: "lx", default: 0 },
        { type: "float", name: "ly", default: 1 },
        { type: "float", name: "lz", default: 0 },
        { type: "float", name: "shininess", default: 32 },
        { type: "float", name: "intensity", default: 1 }
      ],
      glsl: `
      vec3 lightDir = normalize(vec3(lx, ly, lz));
      vec3 normal = normalize(v_worldNormal);
      vec3 viewDir = normalize(v_viewDir);
      vec3 halfDir = normalize(lightDir + viewDir);
      float spec = pow(max(0.0, dot(normal, halfDir)), shininess) * intensity;
      return vec4(_c0.rgb + spec, _c0.a);`,
      wgsl: `
      let lightDir = normalize(vec3<f32>(lx, ly, lz));
      let normal = normalize(v_worldNormal);
      let viewDir = normalize(v_viewDir);
      let halfDir = normalize(lightDir + viewDir);
      let spec = pow(max(0.0, dot(normal, halfDir)), shininess) * intensity;
      return vec4<f32>(_c0.rgb + spec, _c0.a);`
    },
    {
      name: "fresnel",
      type: "color",
      inputs: [
        { type: "float", name: "power", default: 2 },
        { type: "float", name: "intensity", default: 1 }
      ],
      glsl: `
      vec3 normal = normalize(v_worldNormal);
      vec3 viewDir = normalize(v_viewDir);
      float f = pow(1.0 - abs(dot(normal, viewDir)), power) * intensity;
      return vec4(_c0.rgb + f, _c0.a);`,
      wgsl: `
      let normal = normalize(v_worldNormal);
      let viewDir = normalize(v_viewDir);
      let f = pow(1.0 - abs(dot(normal, viewDir)), power) * intensity;
      return vec4<f32>(_c0.rgb + f, _c0.a);`
    },
    {
      name: "halfLambert",
      type: "color",
      inputs: [
        { type: "float", name: "lx", default: 0 },
        { type: "float", name: "ly", default: 1 },
        { type: "float", name: "lz", default: 0 }
      ],
      glsl: `
      vec3 lightDir = normalize(vec3(lx, ly, lz));
      vec3 normal = normalize(v_worldNormal);
      float diff = dot(normal, lightDir) * 0.5 + 0.5;
      return vec4(_c0.rgb * diff, _c0.a);`,
      wgsl: `
      let lightDir = normalize(vec3<f32>(lx, ly, lz));
      let normal = normalize(v_worldNormal);
      let diff = dot(normal, lightDir) * 0.5 + 0.5;
      return vec4<f32>(_c0.rgb * diff, _c0.a);`
    }
  ];
  let sharedDevice = null;
  let sharedAdapter = null;
  let initPromise = null;
  async function initSharedDevice() {
    if (!navigator.gpu) {
      throw new Error("WebGPU is not supported on this browser.");
    }
    sharedAdapter = await navigator.gpu.requestAdapter();
    if (!sharedAdapter) {
      throw new Error("Failed to get GPU adapter.");
    }
    const hasBGRA8unormStorage = sharedAdapter.features.has("bgra8unorm-storage");
    sharedDevice = await sharedAdapter.requestDevice({
      requiredFeatures: hasBGRA8unormStorage ? ["bgra8unorm-storage"] : []
    });
    sharedDevice.lost.then((info) => {
      console.error(`WebGPU device was lost: ${info.message}`);
      sharedDevice = null;
      sharedAdapter = null;
      initPromise = null;
    });
    return sharedDevice;
  }
  async function getSharedDevice() {
    if (sharedDevice) {
      return sharedDevice;
    }
    if (!initPromise) {
      initPromise = initSharedDevice();
    }
    return initPromise;
  }
  function hasSharedDevice() {
    return sharedDevice !== null;
  }
  function releaseSharedDevice() {
    if (sharedDevice) {
      sharedDevice.destroy();
      sharedDevice = null;
      sharedAdapter = null;
      initPromise = null;
    }
  }
  const VERSION = "0.1.0";
  let _hydra = null;
  function createLoop(fn) {
    let running = false;
    let lastTime = performance.now();
    let rafId = null;
    function tick() {
      if (!running) return;
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      fn(dt);
      rafId = requestAnimationFrame(tick);
    }
    return {
      start() {
        if (running) return this;
        running = true;
        lastTime = performance.now();
        rafId = requestAnimationFrame(tick);
        return this;
      },
      stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        return this;
      }
    };
  }
  function install(hydra, options = {}) {
    if (typeof window !== "undefined") {
      if (window.__hydraVertexWebGPU) {
        console.error("[hydra-vertex] ⚠️ WebGPU vertex extension already loaded!");
        console.error("[hydra-vertex] Mixing WebGL and WebGPU extensions causes errors.");
        console.error("[hydra-vertex] Reload the page and use only one extension.");
        return false;
      }
      window.__hydraVertexWebGL = VERSION;
    }
    console.log(`[hydra-vertex] Installing vertex shader extension v${VERSION}`);
    _hydra = hydra;
    const synth = hydra.synth;
    if (!synth) {
      console.error("[hydra-vertex] Could not find hydra.synth");
      return false;
    }
    if (hydra.looper) {
      hydra.looper.stop();
      hydra.looper = createLoop(hydra.tick.bind(hydra)).start();
      console.log("[hydra-vertex] Replaced animation loop with fixed version");
    }
    registerGeometryFunctions(synth);
    registerLightingFunctions(synth);
    synth.v = v;
    if (typeof window !== "undefined") {
      window.v = v;
    }
    synth.VertexSource = VertexSource;
    if (typeof window !== "undefined") {
      window.VertexSource = VertexSource;
    }
    patchGlslSource(hydra);
    patchOutput(hydra);
    patchHush(hydra);
    setupResizeObserver(hydra);
    setupContextLossDetection(hydra);
    console.log("[hydra-vertex] Extension installed successfully");
    return true;
  }
  function setupContextLossDetection(hydra) {
    const canvas = hydra.canvas;
    if (!canvas) return;
    const gl = hydra.regl._gl;
    canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      console.error("[hydra-vertex] ⚠️ WebGL context LOST! GPU may have crashed or timed out.");
      console.error("[hydra-vertex] This can happen with very complex scenes (many instances, complex shaders).");
      hydra._contextLost = true;
      if (typeof window !== "undefined" && window.alert) {
        console.error("%c WebGL Context Lost - GPU timeout or crash ", "background: #ff0000; color: white; font-size: 16px;");
      }
    });
    canvas.addEventListener("webglcontextrestored", (event) => {
      console.log("[hydra-vertex] ✓ WebGL context restored! Reinitializing...");
      hydra._contextLost = false;
      for (const output of hydra.o) {
        if (output.clearSprites) {
          output.clearSprites();
        }
      }
      console.log("[hydra-vertex] Context restored. You may need to re-run your code.");
    });
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (debugInfo) {
      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      console.log(`[hydra-vertex] GPU: ${vendor} - ${renderer}`);
    }
    console.log("[hydra-vertex] WebGL context loss detection enabled");
  }
  function setupResizeObserver(hydra) {
    const canvas = hydra.canvas;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width * (window.devicePixelRatio || 1));
        const height = Math.round(entry.contentRect.height * (window.devicePixelRatio || 1));
        if (canvas.width !== width || canvas.height !== height) {
          console.log(`[hydra-vertex] Canvas resized: ${width}x${height}`);
          hydra.setResolution(width, height);
        }
      }
    });
    observer.observe(canvas);
    hydra._vertexResizeObserver = observer;
  }
  function registerGeometryFunctions(synth) {
    const geometryFunctions = {
      tri,
      quad,
      poly,
      circle,
      line,
      ring,
      cube,
      sphere,
      plane,
      torus,
      cylinder,
      cone,
      parseObj,
      loadObj,
      parseGlb,
      loadGlb
    };
    for (const [name, fn] of Object.entries(geometryFunctions)) {
      synth[name] = fn;
      if (typeof window !== "undefined") {
        window[name] = fn;
      }
    }
    console.log("[hydra-vertex] Registered geometry functions");
  }
  function registerLightingFunctions(synth) {
    for (const fn of lightingFunctions) {
      synth.setFunction(fn);
    }
    console.log("[hydra-vertex] Registered lighting functions");
  }
  function patchGlslSource(hydra) {
    const testSource = hydra.synth.osc ? hydra.synth.osc() : null;
    if (!testSource) return;
    const GlslSourceProto = Object.getPrototypeOf(testSource);
    GlslSourceProto.out = GlslSource.prototype.out;
    GlslSourceProto.glsl = GlslSource.prototype.glsl;
    GlslSourceProto.compile = GlslSource.prototype.compile;
    console.log("[hydra-vertex] GlslSource patched");
  }
  function patchOutput(hydra) {
    const output = hydra.o[0];
    if (!output) return;
    const OutputProto = Object.getPrototypeOf(output);
    OutputProto.registerSprite = Output.prototype.registerSprite;
    OutputProto.enableDepthBuffer = Output.prototype.enableDepthBuffer;
    OutputProto._renderSprites = Output.prototype._renderSprites;
    OutputProto.clearSprites = Output.prototype.clearSprites;
    OutputProto.removeSprite = Output.prototype.removeSprite;
    OutputProto.enableSprite = Output.prototype.enableSprite;
    OutputProto.disableSprite = Output.prototype.disableSprite;
    OutputProto.tick = Output.prototype.tick;
    OutputProto.render = Output.prototype.render;
    for (const o of hydra.o) {
      o.defaultPositionBuffer = o.regl.buffer([
        [-2, 0, 0],
        [0, -2, 0],
        [2, 2, 0]
      ]);
      o.positionBuffer = o.defaultPositionBuffer;
      o.sprites = /* @__PURE__ */ new Map();
      o.hasDepthBuffer = false;
      o.vert = `
    precision ${o.precision} float;
    attribute vec3 position;
    varying vec2 uv;
    varying float v_faceId;
    varying float v_instanceId;

    // Vertex data for fragment shader (default values for fullscreen quad)
    varying vec3 v_position;
    varying vec3 v_normal;
    varying vec3 v_worldNormal;
    varying vec3 v_tangent;
    varying vec3 v_bitangent;
    varying vec3 v_viewDir;
    varying float v_depth;

    void main () {
      uv = position.xy;
      v_faceId = 0.0;
      v_instanceId = 0.0;

      // Default vertex data for fullscreen quad
      v_position = vec3(position.xy * 2.0 - 1.0, 0.0);
      v_normal = vec3(0.0, 0.0, 1.0);
      v_worldNormal = vec3(0.0, 0.0, 1.0);
      v_tangent = vec3(1.0, 0.0, 0.0);
      v_bitangent = vec3(0.0, 1.0, 0.0);
      v_viewDir = vec3(0.0, 0.0, 1.0);
      v_depth = 1.0;

      gl_Position = vec4(2.0 * position.xy - 1.0, 0, 1);
    }`;
      o.copyCommand = o.regl({
        frag: `
        precision ${o.precision} float;
        uniform sampler2D source;
        varying vec2 uv;
        void main () {
          gl_FragColor = texture2D(source, uv);
        }
      `,
        vert: o.vert,
        attributes: {
          position: o.defaultPositionBuffer
        },
        uniforms: {
          source: o.regl.prop("source")
        },
        count: 3,
        depth: { enable: false }
      });
    }
    console.log("[hydra-vertex] Output patched");
  }
  function patchHush(hydra) {
    hydra.hush = function() {
      hydra.s.forEach((source) => {
        source.clear();
      });
      hydra.o.forEach((output) => {
        if (output.clearSprites) {
          output.clearSprites();
        }
        if (output.fbos) {
          output.fbos.forEach((fbo) => {
            output.regl.clear({
              color: [0, 0, 0, 1],
              depth: 1,
              framebuffer: fbo
            });
          });
        }
      });
      hydra.synth.render(hydra.o[0]);
      if (hydra.sandbox) {
        hydra.sandbox.set("update", (dt) => {
        });
        hydra.sandbox.set("afterUpdate", (dt) => {
        });
      }
    };
    if (hydra.sandbox) {
      hydra.sandbox.set("hush", hydra.hush);
    }
    console.log("[hydra-vertex] hush() patched");
  }
  function cleanup(hydra) {
    hydra = hydra || _hydra;
    if (!hydra) return;
    for (const output of hydra.o) {
      if (output && output.sprites) {
        output.clearSprites();
      }
    }
  }
  exports2.VERSION = VERSION;
  exports2.VertexSource = VertexSource;
  exports2.circle = circle;
  exports2.cleanup = cleanup;
  exports2.cone = cone;
  exports2.cube = cube;
  exports2.cylinder = cylinder;
  exports2.getSharedDevice = getSharedDevice;
  exports2.hasSharedDevice = hasSharedDevice;
  exports2.install = install;
  exports2.line = line;
  exports2.loadGlb = loadGlb;
  exports2.loadObj = loadObj;
  exports2.parseGlb = parseGlb;
  exports2.parseObj = parseObj;
  exports2.plane = plane;
  exports2.poly = poly;
  exports2.quad = quad;
  exports2.releaseSharedDevice = releaseSharedDevice;
  exports2.ring = ring;
  exports2.sphere = sphere;
  exports2.torus = torus;
  exports2.tri = tri;
  exports2.v = v;
  Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
}));
//# sourceMappingURL=vertex-webgl.umd.js.map
