
import { GetServerSideProps } from 'next';
import { ChangeEvent, FormEvent, useState, useEffect } from 'react';
import styles from './styles.module.css'
import Head from 'next/head'
import { getSession } from 'next-auth/react';
import { TextArea } from '../../components/txtarea';
import {FiShare2} from 'react-icons/fi'
import {FaTrash } from 'react-icons/fa'

import db from '../../services/firebaseConnection'

import { addDoc, collection, query, orderBy, where, onSnapshot, doc, deleteDoc, DocumentData, Query, getDocs} from 'firebase/firestore'

import Link from 'next/link';

interface HomeProps {
    user: {
        id: string;
        name: string;
    }
}

interface TaskProps {
id: string,
created: Date,
public: boolean,
task: string,
userId: string
userName: string
}

export default function Dashboard({ user  }:HomeProps){

    const [input, setInput] = useState('')
    const [publicTask, setPublicTask] = useState(false)
    const [tasks, setTasks] = useState<TaskProps[]>([])

    useEffect(() => { 
        async function loadTasks() {
            const taskRef = collection(db, "tasks")
            const q = query(
                taskRef,
                orderBy("created", "desc"),
                where('userId','==', user.id)
            )
            onSnapshot(q, (snapshot) => {
               let list = [] as TaskProps[];
               snapshot.forEach((doc) => {
                list.push({
                    id: doc.id,
                    created: doc.data().created,
                    public: doc.data().public,
                    task: doc.data().task,
                    userId: doc.data().userId,
                    userName: doc.data().name
                });
               });

            //    console.log("a lista é:", list);
               setTasks(list);

            })
        }
        loadTasks();
    }, [user.id])

    


    function handleChangePublic(event: ChangeEvent<HTMLInputElement>) {
        setPublicTask(event.target.checked)
    }

    async function handleRegisterTask(event: FormEvent ) {
        event.preventDefault();
        if( input === "") return;

        try{
        await addDoc(collection(db, "tasks"), {
            task: input,
            created: new Date(),
            userId: user.id,
            name: user.name,
            public: publicTask
        });

        setInput("")
        setPublicTask(false)

        // toast.success("Tarefa registrada com sucesso!")
        }
        catch(err) {
            console.log(err)
        }

        }

        async function handleShare(id:string) {
            await navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_URL}/task/${id}`
            );

            alert("URL copied!")
        }

        async function handleDeleteTask(id:string){

            const docRef = doc(db, 'tasks', id)

            const queryComments = query(collection(db, 'comments'),where('idTask', '==', id))

            const snapshotComments = await getDocs(queryComments)

            await deleteDoc(docRef)

            await snapshotComments.forEach((item) => {

                const docRefComment = doc(db, 'comments', item.id)

                deleteDoc(docRefComment)


             })


        }


    return(
        <div className={styles.container}>
            <Head>
                <title>My Dashboard of tasks</title>
            </Head>

            <main className={styles.main}>
                <section className={styles.content}>
                    <div className={styles.contentForm}>
                        <h1 className={styles.title}>
                            What is your task?</h1>
                        <form onSubmit={handleRegisterTask}>
                            <TextArea placeholder='Digit your task...'
                            value={input}
                            onChange={ (event:ChangeEvent<HTMLTextAreaElement>) => 
                                setInput(event.target.value)}
                            />
                            <div className={styles.checkBoxArea}>
                                <input
                                type='checkbox'
                                className={styles.checkBox}
                                checked={publicTask}
                                onChange={handleChangePublic}
                                />
                                <label> Make task public?</label>
                            </div>
                            <button className={styles.button} type='submit'>Register</button>
                        </form>
                    </div>
                </section>

                <section className={styles.taskContainer}>
                    <h1>My Tasks</h1>

                    {tasks.map((item) => (
                        <article key={item.id} className={styles.task}>
                        {item.public && (
                            <div className={styles.tagContainer}>
                            <label className={styles.tag}>
                                Public
                            </label>
                            <button className={styles.trashButton} 
                                    onClick={() => handleShare(item.id)}>
                                <FiShare2
                                size={22}
                                color="#3183ff"
                                />
                            </button>
                        </div>
                        )}
                        <div className={styles.taskContent}>
                            {item.public ? (
                                <Link href={`/task/${item.id}`}>
                                    <p>{item.task}</p>
                                </Link>
                            ) : (
                                <p>{item.task}</p>
                            )
                            }

                            <button className={styles.trashButton}>
                                <FaTrash
                                size={22}
                                color="#ea3140"
                                onClick={() => handleDeleteTask(item.id)}
                                />
                            </button>
                        </div>
                    </article>
                    ))}
                </section>
            </main>
        </div>


    );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {

    const session = await getSession({ req })

    // console.log(session)
    if(!session?.user){
        return{
            redirect:{
                destination:'/',
                permanent: false
            }
        }
    }
    return{
        props: {
            user: {
                name: session?.user.name,
                id: session?.user.email,
            }
        },
    };
};
