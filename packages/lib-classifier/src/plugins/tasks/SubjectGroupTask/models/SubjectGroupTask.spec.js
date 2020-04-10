import { types } from 'mobx-state-tree'
import SubjectGroupTask from '@plugins/tasks/SubjectGroupTask'

const SubjectGroupTask = {
  answers: [
    { label: 'yes', next: 'S2' },
    { label: 'no', next: 'S3' }
  ],
  question: 'Do you exist?',
  required: false,
  taskKey: 'T1',
  type: 'single'
}

describe('Model > SubjectGroupTask', function () {
  it('should exist', function () {
    const SubjectGroupTaskInstance = SubjectGroupTask.TaskModel.create(SubjectGroupTask)
    expect(SubjectGroupTaskInstance).to.be.ok()
    expect(SubjectGroupTaskInstance).to.be.an('object')
  })

  it('should error for invalid tasks', function () {
    let errorThrown = false
    try {
      SubjectGroupTask.create({})
    } catch (e) {
      errorThrown = true
    }
    expect(errorThrown).to.be.true()
  })

  describe('with an annotation', function () {
    let task

    before(function () {
      task = SubjectGroupTask.TaskModel.create(SubjectGroupTask)
      const annotation = task.defaultAnnotation
      const store = types.model('MockStore', {
        annotation: SubjectGroupTask.AnnotationModel,
        task: SubjectGroupTask.TaskModel
      })
      .create({
        annotation,
        task
      })
      task.setAnnotation(annotation)
    })

    it('should start up with a null value', function () {
      expect(task.annotation.value).to.be.null()
    })

    it('should update annotations', function () {
      task.updateAnnotation(1)
      expect(task.annotation.value).to.equal(1)
    })
  })

  describe('when required', function () {
    let task

    before(function () {
      const requiredTask = Object.assign({}, SubjectGroupTask, { required: true })
      task = SubjectGroupTask.TaskModel.create(requiredTask)
      const annotation = task.defaultAnnotation
      const store = types.model('MockStore', {
        annotation: SubjectGroupTask.AnnotationModel,
        task: SubjectGroupTask.TaskModel
      })
      .create({
        annotation,
        task
      })
      task.setAnnotation(annotation)
    })

    describe('with an incomplete annotation', function () {
      it('should be incomplete', function () {
        expect(task.isComplete).to.be.false()
      })
    })

    describe('with a complete annotation', function () {
      it('should be complete', function () {
        task.updateAnnotation(1)
        expect(task.isComplete).to.be.true()
      })
    })
  })
})
