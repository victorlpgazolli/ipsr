import api from "../../services/api";

export async function getServerSideProps(req, res) {
    const { slug } = req.query;
    const [author, packageName, ...otherProps] = slug;
    const hasUrlError = otherProps.length !== 0;
    if (hasUrlError) return {
        props: {
            error: "Wrong url"
        }
    }
    const packageSlug = [author, packageName].join("/")
    const {
        data: { name }
    } = await api.get("/api/v1/packages/" + packageSlug);

    return {
        props: {
            name
        }
    }
}

export default function Home({ name, error }) {
    if (error) return (
        <div><p>{error}</p></div>
    )
    return (
        <div >
        </div>
    )
}
