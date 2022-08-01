import { FormEventHandler, useCallback, useRef, useState } from 'react'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { json, LoaderFunction, useLoaderData } from 'remix'
import BaseForm from '~/components/ui/BaseForm'
import FormControl from '~/components/ui/forms/FormControl'
import FormLabel from '~/components/ui/forms/FormLabel'
import Textarea from '~/components/ui/forms/Textarea'
import UtilLayout from '~/components/ui/layouts/UtilLayout'
import ResultsSection from '~/components/ui/sections/ResultsSection'
import SubmitButton from '~/components/ui/SubmitButton'
import { commonMetaFactory } from '~/lib/all-utils'
import { getUtilBySlug, Util } from '~/lib/all-utils.server'
import { getMaybeLinksFromTextParam } from '~/lib/link-lines'
import { passthroughCachingHeaderFactory } from '~/lib/headers'
import ResetButton from '~/components/ui/ResetButton'

export const meta = commonMetaFactory()
export const headers = passthroughCachingHeaderFactory()

type LoaderData = {
  utilData: Util
  links: string[] | null
}

export const loader: LoaderFunction = async ({ request }) => {
  const utilData = getUtilBySlug('link-lines')

  const url = new URL(request.url)
  const text = url.searchParams.get('text')

  return json<LoaderData>(
    { utilData, links: getMaybeLinksFromTextParam(text) },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=31536000',
      },
    }
  )
}

const IDS = {
  textarea: 'links-text',
  form: 'links-form',
}

const SupaCron = () => {
  const { utilData, links: initialLinks } = useLoaderData<LoaderData>()
  const form = useRef<HTMLFormElement>(null)

  const { links, onHydratedSubmit } = useSplitLinks(initialLinks)

  return (
    <UtilLayout className="flex flex-col" util={utilData}>
      {links?.length ? (
        <ResultsSection utilSlug={utilData.slug} title="Your Links">
          {links.map((href, i) => (
            <a
              href={href}
              key={`${i}-${href}`}
              className="flex link link-primary p-4 hover:bg-base-300 border-2 border-primary items-center justify-between break-all space-x-4"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span>{href}</span>
              <ExternalLinkIcon className="flex-shrink-0 w-6 h-6" />
            </a>
          ))}
        </ResultsSection>
      ) : null}
      <BaseForm onSubmit={onHydratedSubmit} id={IDS.form} ref={form}>
        <FormControl>
          <FormLabel htmlFor={IDS.textarea}>Your links</FormLabel>
          <Textarea name="text" id={IDS.textarea} minHeight="16rem" />
        </FormControl>
        <SubmitButton>Get Links!</SubmitButton>
      </BaseForm>
      <ResetButton
        onClick={event => {
          event.preventDefault()
          form.current?.reset()
        }}
      />
    </UtilLayout>
  )
}

export default SupaCron

const useSplitLinks = (initialLinks: string[] | null) => {
  const [links, setLinks] = useState(initialLinks)

  const onHydratedSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    event => {
      event.preventDefault()
      const formdata = new FormData(event.currentTarget)

      const textFromForm = formdata.get('text')

      setLinks(
        typeof textFromForm === 'string'
          ? getMaybeLinksFromTextParam(textFromForm)
          : null
      )
    },
    []
  )

  return {
    links,
    onHydratedSubmit,
  }
}
