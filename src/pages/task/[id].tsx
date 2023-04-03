import Head from 'next/head'
import { GetServerSideProps } from 'next'
import styles from './styles.module.css'
import db   from '../../services/firebaseConnection'
import {ChangeEvent, FormEvent, useState} from 'react'
import {useSession} from 'next-auth/react'
import { FaTrash } from 'react-icons/fa'


import { TextArea } from '@/components/txtarea'

import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc, getDoc, getDocs, Timestamp} from 'firebase/firestore'

interface TaskProps {
    itemTask:
    {
        taskId: string,
        created: string,
        public: boolean,
        task: string,
        userId: string
        userName: string
    };

    allComments: CommentProps[]


}

interface CommentProps {
    id: string,
    comment: string,
    idTask: string,
    user: string,
    name: string,
    created: string
    
}


export default function Task({itemTask, allComments }:TaskProps){

    const { data: session } = useSession();

    const [ input, setInput] = useState('');

    const [ comments, setComments] = useState<CommentProps[]>(allComments || []);


    async function handleSubmitComment(event: FormEvent){

        event.preventDefault();
    
        if(input === '') return;
        if(!session?.user?.email || !session?.user?.name) return;

        try{
            const docRef = await addDoc(collection(db,'comments'), {
                comment: input,
                created: new Date(),
                user: session?.user?.email,
                name:  session?.user?.name,
                idTask:  itemTask?.taskId
            })

            const dataComment = {
                id: docRef.id,
                comment: input,
                created: itemTask.created,
                user: session?.user?.email,
                name:  session?.user?.name,
                idTask:  itemTask?.taskId
            }

            setComments((oldItem) => [...oldItem, dataComment] )

            setInput('')
        }catch(err){
            console.log(err)
        }
    }

    async function handleDeleteComment(id: string){
        try{

            const docRef =  doc(db,'comments',id)

            await deleteDoc(docRef);

            const deletedComment = comments.filter( (item) => item.id !== id)

            setComments(deletedComment)
            
        }catch(err){
            console.log(err)
        }
    }

    return(
        <div className={styles.container}>
            <Head>
                <title>Task Detail</title>
            </Head>

        <main className={styles.main}>
            <h1>Task:</h1>
            <article className={styles.task}>
                <p>
                    {itemTask.task}
                </p>
            </article>
        </main>

        <section className={styles.commentContainer}>
            <h2>Comments:</h2>
            <form onSubmit={handleSubmitComment}>
            <TextArea
            placeholder='Digit your comment...'
            value={input}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {setInput(event.target.value)}}
            />
            <button
            disabled={!session?.user } 
            className={styles.button}>Comment</button>
            </form>

        </section>

        <section className={styles.commentContainer}>
            <h2>All Comments:</h2>
            {comments.length === 0 && (
                <span>No Comments Found</span>
            )}
            {comments.map((itemComment) => (
            <article key={itemComment.id} className={styles.comment}>
                <div className={styles.headComment}>
                    <label className={styles.commentLabel}>{itemComment.created}</label>
                    <label className={styles.commentLabel}>{itemComment.name}</label>
                {itemComment.user === session?.user?.email &&(
                     <button className={styles.buttonTrash} onClick={() => handleDeleteComment(itemComment.id)}>
                     <FaTrash size={14} color='#ea3140'/>
                     </button>   
                   )}
                </div>
                <p>{itemComment.comment}</p>

            </article>
            ))}
        </section>
    </div>

    );
}

export const getServerSideProps: GetServerSideProps = async ({params}) => {

    const id = params?.id as string;

    const docRef = doc(db, 'tasks', id)

    const queryComments = query(collection(db, 'comments'),where('idTask', '==', id))

    const snapshotComments = await getDocs(queryComments)
    
    const snapshot = await getDoc( docRef )

    let allComments:CommentProps[] = [];

    snapshotComments.forEach((doc) => {
        allComments.push({
            id: doc.id,
            comment: doc.data().comment,
            created: String(doc.data().created),
            user: doc.data().user,
            name: doc.data().name,
            idTask: doc.data().idTask
        })
    })


    if(snapshot.data() === undefined){
        return{
            redirect:{
                destination: '/',
                permanent: false
            }
        }
    }

    if(!snapshot.data()?.public){
        return{
            redirect:{
                destination: '/',
                permanent: false
            }
        }
    }

    const miliseconds = snapshot.data()?.created?.seconds * 1000;

    const task = {
        task: snapshot.data()?.task,
        public: snapshot.data()?.public,
        created: new Date(miliseconds).toLocaleDateString(),
        userId: snapshot.data()?.userId,
        userName: snapshot.data()?.name,
        taskId: id
    }

    return{
        props: {
            itemTask: task,
            allComments: allComments,
        },
    };
    
};