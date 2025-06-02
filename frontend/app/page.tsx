import React from 'react';
import styles from './page.module.css';
import Image from 'next/image';

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to K8s-Dash
        </h1>
        <p className={styles.description}>
          Multi-cloud Kubernetes Management Platform
        </p>
      </main>
    </div>
  );
}
