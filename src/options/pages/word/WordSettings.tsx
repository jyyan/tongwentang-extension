import { assoc, assocPath, dissocPath, pipe } from 'ramda';
import { FC, Fragment, useCallback, useState } from 'react';
import { LangType } from 'tongwen-core';
import { PrefWord, PrefWordDefault } from '../../../preference/types/v2';
import { i18n } from '../../../service/i18n/i18n';
import { createNoti } from '../../../service/notification/create-noti';
import { storage } from '../../../service/storage/storage';
import { Button, Divider, Modal } from '../../components';
import { useToggle } from '../../hooks/state/use-toggle';
import { useWord } from '../../hooks/word/use-word';
import { WordDefaultSettings } from './WordDefaultSettings';
import { WordEntryEditor } from './WordEntryEditor';
import { WordEntryList } from './WordEntryList';

export const WordSettings: FC = () => {
  const { word, setWord } = useWord();

  const setDefault = useCallback((w: PrefWordDefault) => setWord(assoc('default', w)), [setWord]);

  const [tab, setTab] = useState<LangType | null>(null);

  const [toEdit, setToEdit] = useState<[string, string]>(['', '']);

  const [isModal, { on, off }] = useToggle(false);

  const edit = useCallback(
    (entry?: [string, string]) => {
      setToEdit(entry || ['', '']);
      on();
    },
    [setToEdit, on],
  );

  const update = useCallback(
    ([key, value]: [string, string]) => {
      setWord(
        pipe(
          dissocPath<PrefWord>(['custom', tab!, toEdit[0]]),
          assocPath(['custom', tab!, key], value),
        ),
      );
      off();
    },
    [toEdit, word],
  );

  const remove = useCallback(
    (key: string) => {
      setWord(
        dissocPath<PrefWord>(['custom', tab!, key]),
      );
    },
    [word, setWord, tab],
  );

  const save = useCallback(
    () => storage.set({ word }).then(() => createNoti(i18n.getMessage('MSG_UPDATE_COMPLETED'))),
    [word],
  );

  return (
    <Fragment>
      <div className="panel">
        <div className="panel-nav">
          <ul className="tab tab-block">
            <li className={`tab-item ${tab === null ? 'active' : ''}`}>
              <a style={{ cursor: 'pointer' }} onClick={() => setTab(null)}>
                {i18n.getMessage('MSG_DEFAULT')}
              </a>
            </li>
            <li className={`tab-item ${tab === LangType.s2t ? 'active' : ''}`}>
              <a style={{ cursor: 'pointer' }} onClick={() => setTab(LangType.s2t)}>
                {i18n.getMessage('MSG_CUSTOM_S2T')}
              </a>
            </li>
            <li className={`tab-item ${tab === LangType.t2s ? 'active' : ''}`}>
              <a style={{ cursor: 'pointer' }} onClick={() => setTab(LangType.t2s)}>
                {i18n.getMessage('MSG_CUSTOM_T2S')}
              </a>
            </li>
          </ul>
        </div>

        <div className="panel-body" style={{ padding: '1em', maxHeight: '60vh' }}>
          {tab === null ? (
            <WordDefaultSettings value={word.default} onChange={setDefault} onSave={save} />
          ) : (
            <Fragment>
              <div className="columns">
                <div className="column col-auto">
                  <Button type="primary" onClick={() => edit(['', ''])}>
                    {i18n.getMessage('MSG_ADD')}
                  </Button>
                </div>
                <div className="column col-auto">
                  <Button type="primary" onClick={save}>
                    {i18n.getMessage('MSG_SAVE')}
                  </Button>
                </div>
              </div>
              <Divider />
              <WordEntryList words={word.custom[tab]} onEdit={edit} onRemove={remove} />
            </Fragment>
          )}
        </div>
      </div>
      <Modal isActive={isModal} onCancel={off}>
        <WordEntryEditor entry={toEdit} onSubmit={update} />
      </Modal>
    </Fragment>
  );
};
