import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, StarOff } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import {
  addDictionaryFavorite,
  DictionaryLetter,
  DictionaryWord,
  fetchCourseDictionaryLetterWords,
  fetchCourseDictionaryLetters,
  fetchCourseDictionaryMyFavorites,
  removeDictionaryFavorite
} from "@/lib/api";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

const isValidWord = (word: DictionaryWord | null | undefined): word is DictionaryWord => {
  return Boolean(word && typeof word === "object");
};

const isValidLetter = (letter: DictionaryLetter | null | undefined): letter is DictionaryLetter => {
  return Boolean(letter?.letter);
};

const getEntityId = (entity: { _id?: string; id?: string } | null | undefined) => {
  return entity?._id || entity?.id || "";
};

const getWordId = (word: DictionaryWord | string) => {
  if (!word || typeof word === "string") return word || "";
  return getEntityId(word);
};

const getPartArabic = (word: DictionaryWord, part: "verb" | "noun" | "adjective") => {
  return word?.[part]?.arabic || "";
};

const getPartMeaning = (word: DictionaryWord, part: "verb" | "noun" | "adjective") => {
  return word?.[part]?.meaning || "";
};

const formatCell = (value: string) => {
  if (!value) return "—";
  return value;
};

const CourseDictionary = () => {
  const { courseId = "" } = useParams();
  const { lang } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"dictionary" | "favorites">("dictionary");
  const [selectedLetter, setSelectedLetter] = useState<string>("");

  const lettersQuery = useQuery({
    queryKey: ["dictionary-letters", courseId],
    queryFn: () => fetchCourseDictionaryLetters(courseId),
    enabled: Boolean(courseId)
  });

  const letters = (lettersQuery.data?.data?.letters ?? []).filter(isValidLetter);

  useEffect(() => {
    if (!selectedLetter && letters.length) {
      setSelectedLetter(letters[0].letter);
      return;
    }

    if (selectedLetter && letters.length) {
      const stillExists = letters.some((l) => l.letter === selectedLetter);
      if (!stillExists) setSelectedLetter(letters[0].letter);
    }
  }, [letters, selectedLetter]);

  const wordsQuery = useQuery({
    queryKey: ["dictionary-words", courseId, selectedLetter],
    queryFn: () => fetchCourseDictionaryLetterWords(courseId, selectedLetter),
    enabled: Boolean(courseId) && Boolean(selectedLetter) && activeTab === "dictionary"
  });

  const favoritesQuery = useQuery({
    queryKey: ["dictionary-favorites", courseId],
    queryFn: () => fetchCourseDictionaryMyFavorites(courseId),
    enabled: Boolean(courseId)
  });

  const favoriteItems = favoritesQuery.data?.data?.favorites?.favorites ?? [];

  const favoriteWordIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of favoriteItems) {
      const id = getWordId(item.word);
      if (id) ids.add(id);
    }
    return ids;
  }, [favoriteItems]);

  const addFavoriteMutation = useMutation({
    mutationFn: (wordId: string) => addDictionaryFavorite(wordId),
    onSuccess: () => {
      toast({
        title: lang === "ar" ? "تمت الإضافة" : "נוסף",
        description: lang === "ar" ? "تمت إضافة الكلمة للمفضلة" : "המילה נוספה למועדפים"
      });
      queryClient.invalidateQueries(["dictionary-favorites", courseId]);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed" });
    }
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (wordId: string) => removeDictionaryFavorite(wordId),
    onSuccess: () => {
      toast({
        title: lang === "ar" ? "تمت الإزالة" : "הוסר",
        description: lang === "ar" ? "تمت إزالة الكلمة من المفضلة" : "המילה הוסרה מהמועדפים"
      });
      queryClient.invalidateQueries(["dictionary-favorites", courseId]);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed" });
    }
  });

  const words = (wordsQuery.data?.data?.words ?? []).filter(isValidWord);

  const toggleFavorite = (word: DictionaryWord) => {
    const wordId = getEntityId(word);
    if (!wordId) return;

    if (favoriteWordIds.has(wordId)) {
      removeFavoriteMutation.mutate(wordId);
    } else {
      addFavoriteMutation.mutate(wordId);
    }
  };

  const renderWordsTable = (rows: DictionaryWord[], mode: "dictionary" | "favorites") => {
    const validRows = rows.filter(isValidWord);

    if (!validRows.length) {
      return (
        <div className="text-center text-muted-foreground py-10">
          {mode === "favorites"
            ? lang === "ar"
              ? "لا توجد كلمات في المفضلة لهذا الكورس"
              : "אין מילים במועדפים לקורס הזה"
            : lang === "ar"
              ? "لا توجد كلمات لهذا الحرف بعد"
              : "אין מילים לאות זו עדיין"}
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">{lang === "ar" ? "فعل (عربي)" : "פועל (ערבית)"}</TableHead>
            <TableHead className="text-right">{lang === "ar" ? "فعل (معنى)" : "פועל (משמעות)"}</TableHead>
            <TableHead className="text-right">{lang === "ar" ? "اسم (عربي)" : "שם עצם (ערבית)"}</TableHead>
            <TableHead className="text-right">{lang === "ar" ? "اسم (معنى)" : "שם עצם (משמעות)"}</TableHead>
            <TableHead className="text-right">{lang === "ar" ? "صفة (عربي)" : "תואר (ערבית)"}</TableHead>
            <TableHead className="text-right">{lang === "ar" ? "صفة (معنى)" : "תואר (משמעות)"}</TableHead>
            <TableHead className="text-center w-[120px]">{lang === "ar" ? "المفضلة" : "מועדפים"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {validRows.map((word, rowIndex) => {
            const wordId = getEntityId(word);
            const key = wordId || `${word.letter}-${rowIndex}`;
            const isFav = wordId ? favoriteWordIds.has(wordId) : false;
            const isBusy = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;

            return (
              <TableRow key={key}>
                <TableCell className="text-right font-semibold">{formatCell(getPartArabic(word, "verb"))}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatCell(getPartMeaning(word, "verb"))}</TableCell>
                <TableCell className="text-right font-semibold">{formatCell(getPartArabic(word, "noun"))}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatCell(getPartMeaning(word, "noun"))}</TableCell>
                <TableCell className="text-right font-semibold">{formatCell(getPartArabic(word, "adjective"))}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatCell(getPartMeaning(word, "adjective"))}</TableCell>
                <TableCell className="text-center">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!wordId || isBusy}
                    onClick={() => toggleFavorite(word)}
                    className={cn(
                      "rounded-xl",
                      isFav
                        ? "bg-secondary/70"
                        : "gradient-bg text-primary-foreground hover:text-primary-foreground"
                    )}
                  >
                    {isFav ? <StarOff /> : <Star />}
                    {isFav
                      ? lang === "ar"
                        ? "إزالة"
                        : "הסר"
                      : lang === "ar"
                        ? "إضافة"
                        : "הוסף"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  const favoriteWords: DictionaryWord[] = useMemo(() => {
    const list: DictionaryWord[] = [];
    for (const item of favoriteItems) {
      if (typeof item.word !== "string" && isValidWord(item.word)) {
        list.push(item.word);
      }
    }
    return list;
  }, [favoriteItems]);

  return (
    <div className="space-y-6">
      <div className="glass-card-glow rounded-2xl p-6 md:p-8 border border-primary/10">
        <h2 className="text-xl font-bold mb-2">
          {lang === "ar" ? "قاموس الكلمات" : "מילון מילים"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {lang === "ar"
            ? "اختر حرفًا لعرض الكلمات، وأضف ما تحتاجه إلى المفضلة."
            : "בחרו אות כדי להציג מילים, והוסיפו למועדפים."}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v === "favorites" ? "favorites" : "dictionary")}
      >
        <TabsList className="bg-secondary/60">
          <TabsTrigger value="dictionary">{lang === "ar" ? "القاموس" : "מילון"}</TabsTrigger>
          <TabsTrigger value="favorites">{lang === "ar" ? "المفضلة" : "מועדפים"}</TabsTrigger>
        </TabsList>

        <TabsContent value="dictionary" className="mt-6">
          {lettersQuery.isLoading ? (
            <div className="text-center text-muted-foreground py-10">
              {lang === "ar" ? "جارٍ تحميل الحروف..." : "טוען אותיות..."}
            </div>
          ) : lettersQuery.error ? (
            <div className="text-center text-destructive py-10">
              {(lettersQuery.error as Error).message}
            </div>
          ) : letters.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              {lang === "ar" ? "لا يوجد حروف للقاموس في هذا الكورس" : "אין אותיות במילון לקורס הזה"}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-5 md:p-6 border border-primary/10">
              <div className="flex flex-wrap gap-2">
                {letters.map((l) => (
                  <Button
                    key={getEntityId(l) || l.letter}
                    type="button"
                    size="sm"
                    variant="secondary"
                    className={cn(
                      "rounded-xl",
                      selectedLetter === l.letter ? "gradient-bg text-primary-foreground" : "bg-secondary/70",
                    )}
                    onClick={() => setSelectedLetter(l.letter)}
                  >
                    {l.letter}
                  </Button>
                ))}
              </div>

              <div className="mt-6">
                {wordsQuery.isLoading ? (
                  <div className="text-center text-muted-foreground py-10">
                    {lang === "ar" ? "جارٍ تحميل الكلمات..." : "טוען מילים..."}
                  </div>
                ) : wordsQuery.error ? (
                  <div className="text-center text-destructive py-10">
                    {(wordsQuery.error as Error).message}
                  </div>
                ) : (
                  <div className="rounded-2xl overflow-hidden border border-primary/10 bg-background/40">
                    {renderWordsTable(words, "dictionary")}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          {favoritesQuery.isLoading ? (
            <div className="text-center text-muted-foreground py-10">
              {lang === "ar" ? "جارٍ تحميل المفضلة..." : "טוען מועדפים..."}
            </div>
          ) : favoritesQuery.error ? (
            <div className="text-center text-destructive py-10">
              {(favoritesQuery.error as Error).message}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-5 md:p-6 border border-primary/10">
              <div className="rounded-2xl overflow-hidden border border-primary/10 bg-background/40">
                {renderWordsTable(favoriteWords, "favorites")}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseDictionary;
