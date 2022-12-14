import { Component, ComponentProps } from 'solid-js'
import { createServerAction$ } from 'solid-start/server'
import UtilLayout from '~/components/layouts/UtilLayout'
import SubmitButton from '~/components/ui/SubmitButton'

type HTMLFormProps = ComponentProps<'form'>['onSubmit']

const Testing: Component = () => {
  console.log('hi')
  const [submission1, action1] = createServerAction$(
    async (formData: FormData) => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return `Hi, ${formData.get('name')}`
    }
  )

  const [submission2, action2] = createServerAction$(async (name: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `Hi, ${name}`
  })

  return (
    <UtilLayout
      util={{
        description: 'a',
        path: '/testing',
        slug: 'testing',
        title: 'Testing',
      }}
    >
      <div>result 1: {submission1.result}</div>

      <action1.Form>
        <input
          class="input input-primary w-full"
          type="text"
          required
          name="name"
        ></input>
        <input type="submit">Submit form 1</input>
      </action1.Form>

      <div>result 2: {submission2.result}</div>
      <form
        ref={el => console.log('form2', el)}
        onSubmit={event => {
          console.log('hi1')
          event.preventDefault()
          console.log('hi2')
          const formData = new FormData(event.currentTarget)
          const name = formData.get('name') as string
          action2(name)
        }}
      >
        <input
          class="input input-primary w-full"
          type="text"
          required
          name="name"
        ></input>
        <input type="submit">Submit form 2</input>
      </form>
    </UtilLayout>
  )
}

export default Testing
