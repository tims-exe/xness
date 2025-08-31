import { useEffect, useState } from "react"
import axios from 'axios'

export const useVerify = () => {
    const [isVerified, setIsVerified] = useState<boolean | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const token = localStorage.getItem("token")

                if (!token) {
                    setIsVerified(false)
                    setIsLoading(false)
                    return
                }
                console.log(token)
                const response = await axios.get(`${BACKEND_URL}/api/v1/user/verify`, {
                    headers : {
                        Authorization: token
                    }
                })
                console.log(response.data)
                if (response.data.success) {
                    console.log('verified')
                    setIsVerified(true)
                }
                else {
                    setIsVerified(false)
                }
            } catch (error) {
                console.log('verification failed', error)
                setIsVerified(false)
            } finally {
                setIsLoading(false)
            }
        }
        verifyUser();
    }, [BACKEND_URL]) 

    return {
        isVerified,
        isLoading
    }
}