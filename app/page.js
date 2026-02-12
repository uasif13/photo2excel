import Image from "next/image";
import styles from "./page.module.css";
import ImageUploader from "@/app/ui/upload";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ImageUploader/>
      </main>
    </div>
  );
}
