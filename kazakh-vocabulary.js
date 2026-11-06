// Checked Kazakh equivalents for the 24 unique English headwords in the atlas.
// The source URL is for the Kazakh meaning; existing Russian sources stay in atlas-data.
const KAZAKH_WORDS = Object.freeze({
  canyon:{kk:'шатқал',source:'https://www.gov.kz/article/63300?lang=kk'},
  river:{kk:'өзен',source:'https://corp.soyle.kz/file/download?id=19'},
  rock:{kk:'жартас',source:'https://www.interpress.kz/books/eng/7_class.pdf'},
  lake:{kk:'көл',source:'https://corp.soyle.kz/file/download?id=19'},
  mountain:{kk:'тау',source:'https://corp.soyle.kz/file/download?id=19'},
  forest:{kk:'орман',source:'https://corp.soyle.kz/file/download?id=19'},
  tree:{kk:'ағаш',source:'https://farabi.university/media/book/248131864764481b2232717021943980_1-2017-%D2%9A%D0%B0%D0%B7%D0%B0%D2%9B%D1%88%D0%B0%20%D0%B0%D2%93%D1%8B%D0%BB%D1%88%D1%8B%D0%BD%D1%88%D0%B0%20%D1%81%D3%A9%D0%B7%D0%B4%D1%96%D0%BA%202017.pdf'},
  water:{kk:'су',source:'https://www.interpress.kz/books/eng/3_class.pdf'},
  desert:{kk:'шөл',source:'https://farabi.university/storage/book/248131864764481b2232717021943980_1-2017-%D2%9A%D0%B0%D0%B7%D0%B0%D2%9B%D1%88%D0%B0%20%D0%B0%D2%93%D1%8B%D0%BB%D1%88%D1%8B%D0%BD%D1%88%D0%B0%20%D1%81%D3%A9%D0%B7%D0%B4%D1%96%D0%BA%202017.pdf'},
  dune:{kk:'құм төбе',source:'https://inside.wku.edu.kz/index.php?Itemid=80&gid=9087&lang=kz&option=com_docman&task=doc_download'},
  city:{kk:'қала',source:'https://farabi.university/media/book/248131864764481b2232717021943980_1-2017-%D2%9A%D0%B0%D0%B7%D0%B0%D2%9B%D1%88%D1%8B%D0%BD%D1%88%D0%B0%20%D1%81%D3%A9%D0%B7%D0%B4%D1%96%D0%BA%202017.pdf'},
  history:{kk:'тарих',source:'https://corp.soyle.kz/file/download?id=19'},
  monument:{kk:'ескерткіш',source:'https://tilqural.kz/assets/books/a967a0bf9d117faabfd24f9919abb19c.pdf'},
  mausoleum:{kk:'кесене',source:'https://corp.soyle.kz/file/download?id=19'},
  building:{kk:'ғимарат',source:'https://corp.soyle.kz/file/download?id=19'},
  dome:{kk:'күмбез',source:'https://farabi.university/storage/book/248131864764481b2232717021943980_1-2017-%D2%9A%D0%B0%D0%B7%D0%B0%D2%9B%D1%88%D0%B0%20%D0%B0%D2%93%D1%8B%D0%BB%D1%88%D1%8B%D0%BD%D1%88%D0%B0%20%D1%81%D3%A9%D0%B7%D0%B4%D1%96%D0%BA%202017.pdf'},
  bird:{kk:'құс',source:'https://www.interpress.kz/books/eng/7_class.pdf'},
  rocket:{kk:'зымыран',source:'https://www.goethe-verlag.com/book2/_VOCAB/EN/ENKK/15.HTM'},
  space:{kk:'ғарыш',source:'https://corp.soyle.kz/file/download?id=19'},
  launch:{kk:'ұшыру',source:'https://www.interpress.kz/booklinks/english-plus-kazakh-grade-7-workbook.pdf'},
  salt:{kk:'тұз',source:'https://corp.soyle.kz/file/download?id=19'},
  shore:{kk:'жаға',source:'https://farabi.university/storage/book/248131864764481b2232717021943980_1-2017-%D2%9A%D0%B0%D0%B7%D0%B0%D2%9B%D1%88%D1%8B%D0%BD%D1%88%D0%B0%20%D1%81%D3%A9%D0%B7%D0%B4%D1%96%D0%BA%202017.pdf'},
  stone:{kk:'тас',source:'https://corp.soyle.kz/file/download?id=19'},
  ball:{kk:'шар',source:'https://farabi.university/storage/book/248131864764481b2232717021943980_1-2017-%D2%9A%D0%B0%D0%B7%D0%B0%D2%9B%D1%88%D1%8B%D0%BD%D1%88%D0%B0%20%D1%81%D3%A9%D0%B7%D0%B4%D1%96%D0%BA%202017.pdf'}
});
