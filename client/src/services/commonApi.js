import axios from 'axios'

const api =  axios.create({
    baseURL:'https://bannermaker.onrender.com'
})

const commonAPI = async ( method ,url ,data ) =>{

  try {

    const response = await api({
        method,
        url,
        data
  })

  return response
    
  } catch (error) {
    console.log(error);
  }

}

export default commonAPI
