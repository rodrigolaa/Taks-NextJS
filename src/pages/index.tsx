import Head from 'next/head'
import styles from '../styles/home.module.css'
import Image from 'next/image'
import heroImg from '../../public/assets/hero.png' 
import { GetStaticProps } from 'next';
import db   from '../services/firebaseConnection'

import { collection, query, orderBy, where, onSnapshot, doc, deleteDoc, getDocs} from 'firebase/firestore'

interface HomePros{
  posts: number,
  comments: number,
}

export default function Home({posts, comments}: HomePros) {
  return (
    <>
    <div className={styles.container}>
    <Head>
        <title>Tasks+</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
          className={styles.hero}
          alt='Logo of Tasks+'
          src={heroImg}
          priority
          />
        </div>
        <h1 className={styles.title}>
          Create to easily organize your daily routine!
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box} >
          <span>+ {posts} Posts</span>

          </section>
          <section className={styles.box} >
          <span>+{comments} Comments</span>

          </section>

        </div>
      </main>
    </div>
      
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {

  const commentRef = collection(db,'comments')
  const postef = collection(db,'tasks')

  const commentSnapshot = await getDocs(commentRef)
  const postSnapshot = await getDocs(postef)

  return{
    props: {
      posts: postSnapshot.size ||  0,
      comments: commentSnapshot.size || 0,
    },
    revalidate: 60,
  };
};

