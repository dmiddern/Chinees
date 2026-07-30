import type { Word } from "../types";

export interface WordExample {
  chinese: string;
  pinyin: string;
  dutch: string;
}

const curated: Record<string, WordExample> = {
  爱: { chinese: "我爱我的家人。", pinyin: "Wǒ ài wǒ de jiārén.", dutch: "Ik hou van mijn familie." },
  八: { chinese: "我们八点见。", pinyin: "Wǒmen bā diǎn jiàn.", dutch: "We zien elkaar om acht uur." },
  爸爸: { chinese: "我爸爸是老师。", pinyin: "Wǒ bàba shì lǎoshī.", dutch: "Mijn vader is leraar." },
  吧: { chinese: "我们走吧。", pinyin: "Wǒmen zǒu ba.", dutch: "Laten we gaan." },
  白天: { chinese: "我白天工作。", pinyin: "Wǒ báitiān gōngzuò.", dutch: "Ik werk overdag." },
  半: { chinese: "现在三点半。", pinyin: "Xiànzài sān diǎn bàn.", dutch: "Het is nu half vier." },
  包子: { chinese: "我想吃两个包子。", pinyin: "Wǒ xiǎng chī liǎng ge bāozi.", dutch: "Ik wil twee gestoomde broodjes eten." },
  本: { chinese: "我买了三本书。", pinyin: "Wǒ mǎile sān běn shū.", dutch: "Ik heb drie boeken gekocht." },
  不: { chinese: "我今天不忙。", pinyin: "Wǒ jīntiān bù máng.", dutch: "Ik heb het vandaag niet druk." },
  不客气: { chinese: "不客气，这是我应该做的。", pinyin: "Bú kèqi, zhè shì wǒ yīnggāi zuò de.", dutch: "Graag gedaan, dat doe ik met plezier." },
  不要: { chinese: "不要担心。", pinyin: "Búyào dānxīn.", dutch: "Maak je geen zorgen." },
  茶: { chinese: "我每天喝茶。", pinyin: "Wǒ měitiān hē chá.", dutch: "Ik drink elke dag thee." },
  唱: { chinese: "她很喜欢唱歌。", pinyin: "Tā hěn xǐhuan chànggē.", dutch: "Ze zingt heel graag." },
  超市: { chinese: "超市在银行旁边。", pinyin: "Chāoshì zài yínháng pángbiān.", dutch: "De supermarkt ligt naast de bank." },
  吃: { chinese: "我们一起吃饭吧。", pinyin: "Wǒmen yìqǐ chīfàn ba.", dutch: "Laten we samen eten." },
  穿: { chinese: "今天我穿一件蓝色的衣服。", pinyin: "Jīntiān wǒ chuān yí jiàn lánsè de yīfu.", dutch: "Vandaag draag ik een blauw kledingstuk." },
  打电话: { chinese: "我晚上给你打电话。", pinyin: "Wǒ wǎnshang gěi nǐ dǎ diànhuà.", dutch: "Ik bel je vanavond." },
  大: { chinese: "这个房间很大。", pinyin: "Zhège fángjiān hěn dà.", dutch: "Deze kamer is groot." },
  大家: { chinese: "大家都准备好了。", pinyin: "Dàjiā dōu zhǔnbèi hǎo le.", dutch: "Iedereen is klaar." },
  大学: { chinese: "她在北京上大学。", pinyin: "Tā zài Běijīng shàng dàxué.", dutch: "Ze studeert in Beijing." },
  到: { chinese: "我九点到公司。", pinyin: "Wǒ jiǔ diǎn dào gōngsī.", dutch: "Ik kom om negen uur op kantoor aan." },
  的: { chinese: "这是我的书。", pinyin: "Zhè shì wǒ de shū.", dutch: "Dit is mijn boek." },
  了: { chinese: "我吃饭了。", pinyin: "Wǒ chīfàn le.", dutch: "Ik heb gegeten." },
  吗: { chinese: "你会说中文吗？", pinyin: "Nǐ huì shuō Zhōngwén ma?", dutch: "Kun jij Chinees spreken?" },
  没有: { chinese: "我今天没有时间。", pinyin: "Wǒ jīntiān méiyǒu shíjiān.", dutch: "Ik heb vandaag geen tijd." },
  你: { chinese: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzi?", dutch: "Hoe heet jij?" },
  我: { chinese: "我在学习中文。", pinyin: "Wǒ zài xuéxí Zhōngwén.", dutch: "Ik leer Chinees." },
  我们: { chinese: "我们明天见。", pinyin: "Wǒmen míngtiān jiàn.", dutch: "We zien elkaar morgen." },
  是: { chinese: "他是我的朋友。", pinyin: "Tā shì wǒ de péngyou.", dutch: "Hij is mijn vriend." },
  有: { chinese: "我有两个孩子。", pinyin: "Wǒ yǒu liǎng ge háizi.", dutch: "Ik heb twee kinderen." },
  在: { chinese: "我在家。", pinyin: "Wǒ zài jiā.", dutch: "Ik ben thuis." },
  这: { chinese: "这是什么？", pinyin: "Zhè shì shénme?", dutch: "Wat is dit?" },
};

function firstMeaning(word: Word) {
  return word.meaningNl.split(";")[0].trim();
}

export function exampleForWord(word: Word): WordExample {
  if (curated[word.hanzi]) return curated[word.hanzi];
  const type = word.wordType.toLowerCase();
  const meaning = firstMeaning(word);

  if (type.includes("bijvoeglijk")) {
    return {
      chinese: `这个真的很${word.hanzi}。`,
      pinyin: `Zhège zhēnde hěn ${word.pinyin}.`,
      dutch: `Dit is echt ${meaning}.`,
    };
  }
  if (type.includes("zelfstandig")) {
    return {
      chinese: `这个${word.hanzi}很重要。`,
      pinyin: `Zhège ${word.pinyin} hěn zhòngyào.`,
      dutch: `Deze ${meaning} is belangrijk.`,
    };
  }
  if (type.includes("werkwoord") && !type.includes("hulp")) {
    return {
      chinese: `我想学会怎么${word.hanzi}。`,
      pinyin: `Wǒ xiǎng xuéhuì zěnme ${word.pinyin}.`,
      dutch: `Ik wil leren hoe je “${meaning}” doet.`,
    };
  }
  if (type.includes("voornaamwoord")) {
    return {
      chinese: `${word.hanzi}也在学习中文。`,
      pinyin: `${word.pinyin} yě zài xuéxí Zhōngwén.`,
      dutch: `${meaning} leert ook Chinees.`,
    };
  }
  return {
    chinese: `今天我们学习“${word.hanzi}”这个词。`,
    pinyin: `Jīntiān wǒmen xuéxí “${word.pinyin}” zhège cí.`,
    dutch: `Vandaag leren we het woord “${meaning}”.`,
  };
}
