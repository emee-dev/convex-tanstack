// import { useLottie, LottieOptions } from 'lottie-react'
// import LoadingAnimation from '@/assets/lottie/loading.json'

// export const Loader = () => {
//   const options: LottieOptions = {
//     animationData: LoadingAnimation,
//     loop: true,
//     className: 'h-40 w-40 md:h-60 md:w-60',
//   }
//   const { View } = useLottie(options)

//   return (
//     <div className="flex h-screen w-screen items-center justify-center">
//       <div className="h-40 w-40 md:h-60 md:w-60">{View}</div>
//     </div>
//   )
// }

export const Loader = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="h-40 w-40 md:h-60 md:w-60">Loading...</div>
    </div>
  )
}
