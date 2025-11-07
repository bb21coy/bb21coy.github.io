const Loading = () => {
    return (
        <div className='loading'>
            <img src="/loading.webp" alt="loading" fetchPriority="high" />
            <p>Hang on... We are trying to load this content</p>
        </div>
    )
}

export default Loading