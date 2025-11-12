import Lottie from 'lottie-react'
import LoadingAnimation from '@/assets/lottie/loading.json'

// Bug: due to tanstack trying to ssr this component (my best guess)
// Uncaught Error: Switched to client rendering because the server rendering errored:
export const Loader = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Lottie
        animationData={LoadingAnimation}
        loop={true}
        className="h-40 w-40 md:h-60 md:w-60"
      />
    </div>
  )
}
