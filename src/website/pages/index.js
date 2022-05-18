import Head from 'next/head'
import Image from 'next/image'
import api from '../services/api'
import styles from '../styles/Home.module.css'
export async function getServerSideProps(req, res) {
  const {
    data: { packages }
  } = await api.get("/api/v1/packages");

  return {
    props: {
      packages
    }
  }
}

export default function Home({ packages }) {
  return (
    <div className={styles.container}>
      {packages?.map?.(packageName => <p key={packageName}>{packageName}</p>)}
    </div>
  )
}
